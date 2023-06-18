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
  const config = ConfigHandler.getInstance().config
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
  }
  if (fb_path) {
    cdr = getSiteFromUrl(`https://facebook.com/${fb_path}`, sp.sourceData, config)
    if (cdr.isOk() && cdr.value.site) {
      log(`Found Facebook page ${fb_path}: ${cdr.value.site.name}`)
      response.site = cdr.value.site
      response.domain = cdr.value
      res.send(response)
      return
    }
  }
  if (possible_name) {
    if (possible_name in sp.sourceData.name_pages) {
      log(`Found name ${possible_name}: ${sp.sourceData.name_pages[possible_name]}`)
      cdr = getSiteFromUrl(sp.sourceData.name_pages[possible_name], sp.sourceData, config, fb_path)
      if (cdr.isOk() && cdr.value.site) {
        log(`Found domain from name ${possible_domain}: ${cdr.value.site.name}`)
        response.site = cdr.value.site
        response.domain = cdr.value
        res.send(response)
        return
      }
    }
  }
  log(`No domain found for ${possible_domain} or ${fb_path}`)
  res.send(response)
}

export default handler
