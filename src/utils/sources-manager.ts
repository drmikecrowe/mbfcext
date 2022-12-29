import { Result, err, ok } from 'neverthrow'

import { Storage } from '@plasmohq/storage'

import type { CombinedModel, SiteModel } from './combined-manager'
import { logger } from './logger'

const log = logger('mbfc:background:sources')

export interface SourceData {
  loaded: string
  date: string
  combined: CombinedModel | undefined
  subdomains: Record<string, Record<string, SiteModel>>
  fb_pages: Record<string, string>
  tw_pages: Record<string, string>
  sites_by_domain: Record<string, SiteModel>
}

export class SourcesManager {
  private static instance: SourcesManager

  sourceData: SourceData
  loaded: boolean

  static getInstance(): SourcesManager {
    if (!SourcesManager.instance) {
      SourcesManager.instance = new SourcesManager()
      SourcesManager.instance.loaded = false
      log('SourcesManager initialized')
    }
    return SourcesManager.instance
  }

  async retrieve(): Promise<Result<SourceData, Error>> {
    const storage = new Storage()
    const loaded = await storage.get<boolean>('loaded')
    if (!loaded) return err(new Error('Sources not loaded'))
    const c: SourceData = {
      loaded: 'true',
      date: await storage.get('date'),
      combined: await storage.get('combined'),
      fb_pages: await storage.get('fb_pages'),
      tw_pages: await storage.get('tw_pages'),
      subdomains: await storage.get('subdomains'),
    }
    this.sourceData = c
    return ok(c)
  }
}
