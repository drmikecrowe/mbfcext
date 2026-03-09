import type { Result } from "neverthrow"

import type { PlasmoMessaging } from "@plasmohq/messaging"

import { ConfigHandler, logger } from "~shared"

import type { SiteModel } from "../../models"
import { SourcesProcessor } from "../sources-processor"
import { type CheckDomainResults, getSiteFromUrl } from "../utils"

const log = logger("mbfc:background:messages:get-domain-for-filter")

export const GET_DOMAIN_FOR_FILTER = "get-domain-for-filter"

export type GetDomainForFilterRequestBody = {
  fb_path?: string
  possible_domain?: string
  possible_name?: string
}

export type GetDomainForFilterResponseBody = {
  site?: SiteModel
  domain?: CheckDomainResults
}

const handler: PlasmoMessaging.MessageHandler<GetDomainForFilterRequestBody, GetDomainForFilterResponseBody> = async (req, res) => {
  log("Received request", GET_DOMAIN_FOR_FILTER, req.body)
  const { possible_domain, fb_path, possible_name } = req.body
  const sp = SourcesProcessor.getInstance()
  // Wait for config to be loaded before using it
  const ch = ConfigHandler.getInstance()
  await ch.retrieve()
  const config = ch.config
  const response: GetDomainForFilterResponseBody = { site: null }

  let cdr: Result<CheckDomainResults, null>
  if (possible_domain) {
    cdr = getSiteFromUrl(possible_domain, sp.sourceData, config, fb_path)
    if (cdr.isOk() && cdr.value.site) {
      log(`Found domain ${possible_domain}: ${cdr.value.site.name}`)
      response.site = cdr.value.site
      response.domain = cdr.value
      res.send(response)
      return
    }
    log(`Domain ${possible_domain} not found in database`)
  }
  if (fb_path) {
    // Skip generic profile.php paths - they are not unique identifiers
    if (fb_path.toLowerCase() === 'profile.php') {
      log(`Skipping generic profile.php path`)
    } else {
      log(`Trying Facebook page lookup for ${fb_path}, exists in fb_pages: ${!!sp.sourceData?.fb_pages?.[fb_path.toLowerCase()]}`)
      cdr = getSiteFromUrl(`https://facebook.com/${fb_path}`, sp.sourceData, config)
      if (cdr.isOk() && cdr.value.site) {
        log(`Found Facebook page ${fb_path}: ${cdr.value.site.name}`)
        response.site = cdr.value.site
        response.domain = cdr.value
        res.send(response)
        return
      }
      log(`Facebook page ${fb_path} not found`)
    }
  }
  if (possible_name) {
    const lowerName = possible_name.toLowerCase()
    log(`Trying name lookup for "${lowerName}", exists in name_pages: ${!!sp.sourceData?.name_pages?.[lowerName]}`)
    if (lowerName in sp.sourceData.name_pages) {
      log(`Found name ${lowerName}: ${sp.sourceData.name_pages[lowerName]}`)
      cdr = getSiteFromUrl(sp.sourceData.name_pages[lowerName], sp.sourceData, config, fb_path)
      if (cdr.isOk() && cdr.value.site) {
        log(`Found domain from name ${lowerName}: ${cdr.value.site.name}`)
        response.site = cdr.value.site
        response.domain = cdr.value
        res.send(response)
        return
      }
    }
  }
  log(`No domain found for ${possible_domain} or ${fb_path} or ${possible_name}`)
  res.send(response)
}

export default handler
