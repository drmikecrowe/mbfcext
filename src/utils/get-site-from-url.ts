import { Result, err } from "neverthrow"

import { SourcesProcessor } from "~background/sources-processor"

import { CheckDomainResults, checkDomain } from "./check-domain"
import { getDomain } from "./get-domain"

export const getSiteFromUrl = (url: string): Result<CheckDomainResults, null> => {
  try {
    const sp = SourcesProcessor.getInstance()
    if (!sp.sourceData || !sp.loaded) return err(null)
    const { domain, path } = getDomain(url)
    if (domain) {
      if (domain.indexOf("facebook.com") > -1) {
        if (sp.sourceData.fb_pages[path]) {
          const ndomain = sp.sourceData.fb_pages[path]
          return getSiteFromUrl(`https://${ndomain}`.toLowerCase())
        }
      } else if (domain.indexOf("twitter.com") > -1) {
        if (sp.sourceData.tw_pages[path]) {
          const ndomain = sp.sourceData.tw_pages[path]
          return getSiteFromUrl(`https://${ndomain}`.toLowerCase())
        }
      } else {
        return checkDomain(domain, path)
      }
    }
  } catch (e) {
    // ignore
  }
  return err(null)
}
