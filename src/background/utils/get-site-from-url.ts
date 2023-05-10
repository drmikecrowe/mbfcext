import { Result, err } from "neverthrow"

import type { SourceData } from "~background/sources-processor"
import { getDomain, logger } from "~utils"
import type { ConfigStorage } from "~utils/config-handler"

import { type CheckDomainResults, checkDomain } from "./check-domain"

const log = logger("mbfc:background:utils:get-site-from-url")

export const getSiteFromUrl = (url: string, sourceData: SourceData, config: ConfigStorage): Result<CheckDomainResults, null> => {
  try {
    const { domain, path } = getDomain(url)
    log(`Checking domain ${domain}/${path}`)
    if (domain) {
      if (domain.indexOf("facebook.com") > -1) {
        if (sourceData.fb_pages[path]) {
          const ndomain = sourceData.fb_pages[path]
          return getSiteFromUrl(`https://${ndomain}`.toLowerCase(), sourceData, config)
        }
      } else if (domain.indexOf("twitter.com") > -1) {
        if (sourceData.tw_pages[path]) {
          const ndomain = sourceData.tw_pages[path]
          return getSiteFromUrl(`https://${ndomain}`.toLowerCase(), sourceData, config)
        }
      } else {
        return checkDomain(domain, path, sourceData, config)
      }
    }
  } catch (e) {
    console.error(e)
    // ignore
  }
  return err(null)
}
