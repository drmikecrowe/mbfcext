import type { PlasmoMessaging } from "@plasmohq/messaging"

import { ConfigHandler, logger } from "~utils"

import type { SiteModel } from "../../models"
import { SourcesProcessor } from "../sources-processor"
import { type CheckDomainResults, getSiteFromUrl } from "../utils"

const log = logger("mbfc:background:messages:get-domain-for-filter")

export const GET_DOMAIN_FOR_FILTER = "get-domain-for-filter"

export type GetDomainForFilterRequestBody = {
  fb_path?: string
  possible_domain?: string
}

export type GetDomainForFilterResponseBody = {
  site?: SiteModel
  domain?: CheckDomainResults
}

const handler: PlasmoMessaging.MessageHandler<GetDomainForFilterRequestBody, GetDomainForFilterResponseBody> = async (req, res) => {
  const { possible_domain, fb_path } = req.body
  const sp = SourcesProcessor.getInstance()
  const config = ConfigHandler.getInstance().config
  const response: GetDomainForFilterResponseBody = { site: null }

  log(`Domain ${possible_domain} requested`)
  let cdr = getSiteFromUrl(possible_domain, sp.sourceData, config)
  if (cdr.isOk()) {
    response.site = cdr.value.site
    response.domain = cdr.value
  } else {
    cdr = getSiteFromUrl(fb_path, sp.sourceData, config)
    if (cdr.isOk()) {
      response.site = cdr.value.site
      response.domain = cdr.value
    } else {
      log(`Domains not loaded `)
    }
  }
  res.send(response)
}

export default handler
