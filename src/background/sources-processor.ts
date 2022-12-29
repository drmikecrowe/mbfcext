import { has } from 'lodash'
import { onMessage } from 'webext-bridge'

import { Storage } from '@plasmohq/storage'

import { COMBINED } from '../constants'
import type { CombinedModel } from '../utils/combined-manager'
import { getDomain } from '../utils/get-domain'
import { SourceData, SourcesManager } from '../utils/sources-manager'
import { logger } from '../utils/logger'


const log = logger('mbfc:background:sources')

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export class SourcesProcessor extends SourcesManager {
  private static sm_instance: SourcesProcessor

  retrievingPromise: Promise<SourceData>

  private constructor() {
    super()
  }

  static getInstance(): SourcesProcessor {
    if (!SourcesProcessor.sm_instance) {
      SourcesProcessor.sm_instance = new SourcesProcessor()
      log('SourcesProcessor initialized')
    }
    return SourcesProcessor.sm_instance
  }

  public updateFacebook(d: string) {
    if (!this.sourceData) return
    let fb: string | undefined = this.sourceData.combined.sources[d].f
    if (fb && fb > '') {
      if (fb.indexOf('?') > -1) fb = fb.split('?')[0]
      if (fb && fb > '') {
        const { path } = getDomain(`https://facebook.com/${fb.toLowerCase()}`)
        this.sourceData.fb_pages[path] = d
      }
    }
  }

  public updateTwitter = (d: string) => {
    if (!this.sourceData) return
    let tw = this.sourceData.combined.sources[d].t
    if (tw && tw > '') {
      const matches = /(https?:\/\/twitter.com\/[^/]*)/.exec(tw)
      if (matches && matches[1]) {
        tw = matches[1]
      }
      if (tw && tw > '') {
        const { path } = getDomain(`https://twitter.com/${tw.toLowerCase()}`)
        this.sourceData.tw_pages[path] = d
      }
    }
  }

  public updateSubdomain(d: string) {
    if (!this.sourceData) return
    if (d.indexOf('/') > -1) {
      const { domain, path } = getDomain(`https://${d}`)
      if (!has(this.sourceData.subdomains, domain)) {
        this.sourceData.subdomains[domain] = {}
      }
      this.sourceData.subdomains[domain][path] = this.sourceData.combined.sources[d]
    }
  }

  public async initializeCombined(in_combined: CombinedModel) {
    log('Settings retrieved, processing')
    const c: SourceData = {
      loaded: 'true',
      date: new Date().toISOString().slice(0, 10),
      combined: in_combined,
      fb_pages: {},
      tw_pages: {},
      subdomains: {},
      sites_by_domain: {},
    }
    log('Extracting facebook and twitter domains')
    c.combined.sources.forEach((site) => {
      this.updateFacebook(site.domain)
      this.updateTwitter(site.domain)
      this.updateSubdomain(site.domain)
      c.sites_by_domain[site.domain] = site
    })
    Object.entries(c.sites_by_domain).forEach(([domain, source]) => {
      if (has(c.subdomains, domain)) {
        c.subdomains[domain]['/'] = source
      }
    })
    this.sourceData = c
    return c
  }

  async getSourceData(): Promise<SourceData> {
    if (this.sourceData) return this.sourceData
    if (await this.isLoading()) return this.retrievePending()
    await this.setLoading()
    if (!this.retrievingPromise) this.retrievingPromise = this.retrieveRemote()
    try {
      return this.retrievingPromise
    } catch (e) {
      console.error(`ERROR Loading sources: `, e)
      throw e
    }
  }

  async setLoading(): Promise<void> {
    // set the loading flag in storage with timeout
    const storage = new Storage()
    const tmo = new Date().getTime() + 15 * 1000 // timeout in 15s
    await storage.set('loading', `${tmo}`)
    log(`Loading -- will time out at ${tmo}`)
  }

  async isLoading(): Promise<boolean> {
    // Check the loading status
    const storage = new Storage()
    try {
      const tmo = (await storage.get<number>('loading')) || 0
      const now = new Date().getTime()
      if (now < tmo) {
        const left = Math.round((tmo - now) / 1000)
        log(`Waiting for loading to complete. ${left}s to timeout`)
        return true
      }
      return false
    } catch (err) {
      return false
    }
  }

  async retrievePending(): Promise<SourceData> {
    // wait for loading to be done
    while (await this.isLoading()) {
      log(`Waiting for settings to be retrieved`)
      await wait(1000)
    }
    return this.getSourceData()
  }

  async retrieveRemote(): Promise<SourceData> {
    const res = await fetch(COMBINED)
    const combined: CombinedModel = await res.json()
    log(`Loaded combined data ${combined.version} from ${combined.date}`)
    if (combined) return await this.initializeCombined(combined)
    return this.sourceData
  }

  async areSourcesLoaded(): Promise<boolean> {
    if (this.sourceData.loaded === 'true') return true
    const storage = new Storage()
    const loaded = await storage.get<boolean>('loaded')
    if (loaded) {
      log(`Here we are loaded into localStorage but not memory`)
      await this.retrieve()
      return true
    }
    return false
  }

  async areSourcesStale(): Promise<boolean> {
    const storage = new Storage()
    const loaded = await storage.get<boolean>('loaded')
    if (loaded) {
      const date = await storage.get('date')
      return date !== new Date().toISOString().slice(0, 10)
    }
    return true
  }
}
