import type { PlasmoMessaging } from "@plasmohq/messaging"

import type { PopupDetails } from "~popup"
import { logger } from "~shared"

import { SourcesProcessor } from "../sources-processor"

const log = logger("mbfc:background:messages:get-domain-for-tab")

export const GET_DOMAIN_FOR_TAB = "get-domain-for-tab"

export type GetDomainForTabRequestBody = {
  domain: string
  path: string
}

export type GetDomainForTabResponseBody = {
  site: PopupDetails | null
}

const handler: PlasmoMessaging.MessageHandler<GetDomainForTabRequestBody, GetDomainForTabResponseBody> = async (req, res) => {
  log("Received request", GET_DOMAIN_FOR_TAB, req.body)
  const { domain } = req.body
  const sp = SourcesProcessor.getInstance()
  const response: GetDomainForTabResponseBody = { site: null }

  log(`Domain ${domain} requested`)
  if (sp.sourceData && sp.loaded) {
    if (domain in sp.sourceData.sites_by_domain) {
      log(`Domain ${domain} found`)
      const details = sp.sourceData.sites_by_domain[domain]
      const bias = sp.sourceData.combined.biases.find((b) => b.bias === details.bias)
      log(`Found bias: `, bias)
      response.site = {
        bias: bias.pretty,
        biasDescription: bias.description,
        mbfcLink: details.url,
        rated: true,
      }
    }
  } else {
    log(`Domains not loaded `)
  }
  res.send(response)
}

export default handler
