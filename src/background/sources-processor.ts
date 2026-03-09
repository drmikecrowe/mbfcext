import { Storage } from "@plasmohq/storage"
import { Result, err, ok } from "neverthrow"

import type { CombinedModel, SiteModel } from "~models"

import { COMBINED } from "../constants"
import { getDomain } from "../shared/get-domain"
import { isDevMode, logger } from "../shared/logger"

const log = logger("mbfc:background:sources")

const LAST_LOAD_KEY = "last_load_date"
const DATE_TRIM = isDevMode() ? 16 : 10

// Retry configuration for network failures
const MAX_RETRIES = 3
const INITIAL_DELAY_MS = 1000 // 1 second
const MAX_DELAY_MS = 10000 // 10 seconds

export interface SourceDataError {
  message: string
  retryCount: number
  isNetworkError: boolean
  originalError?: unknown
}

export type DomainSites = Record<string, SiteModel>

export interface SourceData {
  combined: CombinedModel | undefined
  subdomains: Record<string, Record<string, SiteModel>>
  fb_pages: Record<string, string>
  name_pages: Record<string, string>
  sites_by_domain: DomainSites
}

export class SourcesProcessor {
  private static sm_instance: SourcesProcessor

  retrievingPromise: Promise<SourceData>
  sourceData: SourceData
  loaded = false
  loading = false

  static getInstance(): SourcesProcessor {
    if (!SourcesProcessor.sm_instance) {
      SourcesProcessor.sm_instance = new SourcesProcessor()
      log("SourcesProcessor initialized")
    }
    return SourcesProcessor.sm_instance
  }

  public updateFacebook(d: string, fb?: string) {
    if (fb && fb > "") {
      if (fb.indexOf("?") > -1) fb = fb.split("?")[0]
      if (fb && fb > "") {
        const { path } = getDomain(`https://facebook.com/${fb.toLowerCase()}`)
        this.sourceData.fb_pages[path] = d
      }
    }
  }

  public updateSubdomain(d: string) {
    if (!this.sourceData) return
    if (d.indexOf("/") > -1) {
      const { domain, path } = getDomain(`https://${d}`)
      if (!(domain in this.sourceData.subdomains)) {
        this.sourceData.subdomains[domain] = {}
      }
      this.sourceData.subdomains[domain][path] = this.sourceData.combined.sources[d]
    }
  }

  public async initializeCombined(in_combined: CombinedModel) {
    log("Settings retrieved, processing")
    const c: SourceData = {
      combined: in_combined,
      fb_pages: {},
      subdomains: {},
      sites_by_domain: {},
      name_pages: {},
    }
    this.sourceData = c
    log("Extracting facebook domains")
    c.combined.sources.forEach((site) => {
      this.updateFacebook(site.domain, site.facebook)
      this.updateSubdomain(site.domain)
      c.sites_by_domain[site.domain] = site
      c.name_pages[site.name.toLowerCase()] = site.domain
    })
    Object.entries(c.sites_by_domain).forEach(([domain, source]) => {
      if (domain in c.subdomains) {
        c.subdomains[domain]["/"] = source
      }
    })
    await this.setLastLoad()
    this.loading = false
    log(`Source now fully loaded`)
    this.loaded = true
    return c
  }

  async getSourceData(): Promise<SourceData> {
    if (this.loaded) return this.sourceData
    if (!this.loading) {
      this.loading = true
      this.retrievingPromise = this.retrieveRemote()
    }
    return this.retrievingPromise
  }

  /**
   * Sleep for a given number of milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  /**
   * Calculate delay with exponential backoff and jitter
   */
  private calculateBackoff(attempt: number): number {
    const delay = Math.min(INITIAL_DELAY_MS * Math.pow(2, attempt), MAX_DELAY_MS)
    // Add jitter (±10%) to prevent thundering herd
    const jitter = delay * 0.1 * (Math.random() * 2 - 1)
    return Math.round(delay + jitter)
  }

  /**
   * Check if an error is a network-related error that should be retried
   */
  private isRetryableError(error: unknown): boolean {
    if (error instanceof TypeError) {
      // TypeError from fetch usually means network error
      const message = error.message?.toLowerCase() ?? ""
      return (
        message.includes("network") ||
        message.includes("failed to fetch") ||
        message.includes("networkerror") ||
        message.includes("abort") ||
        message.includes("timeout")
      )
    }
    return false
  }

  /**
   * Fetch with retry logic and exponential backoff
   */
  private async fetchWithRetry(url: string, maxRetries: number = MAX_RETRIES): Promise<Result<Response, SourceDataError>> {
    let lastError: SourceDataError | null = null

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        log(`Fetching ${url} (attempt ${attempt + 1}/${maxRetries + 1})`)
        const response = await fetch(url)

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        return ok(response)
      } catch (e) {
        const isNetwork = this.isRetryableError(e)
        lastError = {
          message: e instanceof Error ? e.message : String(e),
          retryCount: attempt,
          isNetworkError: isNetwork,
          originalError: e,
        }

        log(`Fetch attempt ${attempt + 1} failed: ${lastError.message}`)

        // Don't retry if this isn't a retryable error or we've exhausted retries
        if (!isNetwork || attempt >= maxRetries) {
          break
        }

        const delay = this.calculateBackoff(attempt)
        log(`Retrying in ${delay}ms (exponential backoff)...`)
        await this.sleep(delay)
      }
    }

    return err(lastError!)
  }

  async retrieveRemote(): Promise<SourceData> {
    const fetchResult = await this.fetchWithRetry(COMBINED)

    if (fetchResult.isErr()) {
      const error = fetchResult.error
      this.loading = false

      // Log error for debugging and user awareness
      if (error.isNetworkError) {
        console.error(
          `[MBFC] Network error fetching source data after ${error.retryCount + 1} attempts: ${error.message}. ` +
            `Using cached data if available. The extension will retry on the next scheduled refresh.`
        )
      } else {
        console.error(
          `[MBFC] Error fetching source data: ${error.message}. ` +
            `Using cached data if available.`
        )
      }

      // Return existing data if available, allowing graceful degradation
      if (this.sourceData) {
        log(`Returning cached source data due to fetch failure`)
        return this.sourceData
      }

      // No cached data available - this is a critical state
      log(`No cached data available, source data refresh failed`)
      return undefined as unknown as SourceData
    }

    try {
      const res = fetchResult.value
      const combined: CombinedModel = await res.json()
      log(`Loaded combined data ${combined.version} from ${combined.date}`)
      if (combined) return await this.initializeCombined(combined)
      return this.sourceData
    } catch (e) {
      this.loading = false
      console.error(`[MBFC] Error parsing source data: ${e instanceof Error ? e.message : String(e)}`)
      return this.sourceData
    }
  }

  async refreshSources(): Promise<void> {
    const now = new Date().toISOString().slice(0, DATE_TRIM)
    if (this.loaded) {
      const last = await this.getLastLoad()
      if (last !== now) {
        this.loading = true
        this.retrievingPromise = this.retrieveRemote()
      }
    }
  }

  async getLastLoad(): Promise<string | null> {
    const storage = new Storage()
    return storage.get(LAST_LOAD_KEY)
  }

  async setLastLoad(): Promise<string> {
    const storage = new Storage()
    return storage.set(LAST_LOAD_KEY, new Date().toISOString().slice(0, DATE_TRIM))
  }
}
