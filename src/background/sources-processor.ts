import { Storage } from "@plasmohq/storage"

import type { CombinedModel, SiteModel } from "~models"

import { COMBINED } from "../constants"
import { getDomain } from "../shared/get-domain"
import { isDevMode, logger } from "../shared/logger"

const log = logger("mbfc:background:sources")

const LAST_LOAD_KEY = "last_load_date"
const DATE_TRIM = isDevMode() ? 16 : 10

export type DomainSites = Record<string, SiteModel>

export interface SourceData {
  combined: CombinedModel | undefined
  subdomains: Record<string, Record<string, SiteModel>>
  fb_pages: Record<string, string>
  tw_pages: Record<string, string>
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

  public updateTwitter = (d: string, tw?: string) => {
    if (tw && tw > "") {
      const matches = /(https?:\/\/twitter.com\/[^/]*)/.exec(tw)
      if (matches && matches[1]) {
        tw = matches[1]
      }
      if (tw && tw > "") {
        const { path } = getDomain(`https://twitter.com/${tw.toLowerCase()}`)
        this.sourceData.tw_pages[path] = d
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
      tw_pages: {},
      subdomains: {},
      sites_by_domain: {},
      name_pages: {},
    }
    this.sourceData = c
    log("Extracting facebook and twitter domains")
    c.combined.sources.forEach((site) => {
      this.updateFacebook(site.domain, site.facebook)
      this.updateTwitter(site.domain, site.twitter)
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

  async retrieveRemote(): Promise<SourceData> {
    const res = await fetch(COMBINED)
    try {
      const combined: CombinedModel = await res.json()
      log(`Loaded combined data ${combined.version} from ${combined.date}`)
      if (combined) return await this.initializeCombined(combined)
      return this.sourceData
    } catch (e) {
      this.loading = false
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
