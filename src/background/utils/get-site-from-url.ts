import { Result, err } from "neverthrow"

import type { SourceData } from "~background/sources-processor"
import { getDomain, logger } from "~shared"
import type { ConfigStorage } from "~shared/config-handler"

import { type CheckDomainResults, checkDomain } from "./check-domain"

const log = logger("mbfc:background:utils:get-site-from-url")

let first = true

export const getSiteFromUrl = (url: string, sourceData: SourceData, config: ConfigStorage, fb_path?: string): Result<CheckDomainResults, null> => {
  try {
    if (!sourceData || !sourceData.fb_pages || !sourceData.tw_pages) {
      log("No source data")
      return err(null)
    }
    const { domain, path } = getDomain(url)
    log(`Checking domain ${domain}/${path}`)
    if (first) {
      first = false
      log(`Source data:`, sourceData.fb_pages)
    }
    if (domain) {
      const ldomain = domain.toLowerCase()
      const lpath = path.toLowerCase()
      const cdr = checkDomain(ldomain, lpath, sourceData, config)
      if (cdr.isOk() && cdr.value.site) {
        if (fb_path) {
          const lfb_path = fb_path.toLowerCase()
          if (!sourceData.fb_pages[lfb_path] || sourceData.fb_pages[lfb_path] !== ldomain) {
            cdr.value.suggested_fbtwpath = lfb_path
          }
        }
        // TODO: tw_path
        return cdr
      }
      if (ldomain.indexOf("facebook.com") > -1) {
        if (sourceData.fb_pages[lpath]) {
          const ndomain = sourceData.fb_pages[lpath]
          return checkDomain(ndomain, "/", sourceData, config)
        }
      } else if (domain.indexOf("twitter.com") > -1) {
        if (sourceData.tw_pages[path]) {
          const ndomain = sourceData.tw_pages[lpath]
          return checkDomain(ndomain, "/", sourceData, config)
        }
      }
    }
  } catch (e) {
    console.error(e)
    // ignore
  }
  return err(null)
}
