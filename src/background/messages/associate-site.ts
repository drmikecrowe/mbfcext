import type { PlasmoMessaging } from "@plasmohq/messaging"

import type { SiteModel } from "~models"
import { logger } from "~utils"

import { GoogleAnalytics } from "../utils/google-analytics"

const log = logger("mbfc:background:messages:associate-site")

export const ASSOCIATE_SITE = "associate-site"

export type AssociateSiteRequestBody = {
  source: SiteModel
  fb_url: string
}

export type AssociateSiteResponseBody = {
  // void -- no return value
}

const handler: PlasmoMessaging.MessageHandler<AssociateSiteRequestBody, AssociateSiteResponseBody> = async (req, res) => {
  const { source, fb_url } = req.body
  const response: AssociateSiteResponseBody = {}

  log(`Processing AssociateSiteMessage ${source.domain} = ${fb_url}`)
  GoogleAnalytics.getInstance().reportAssociateSite(source.domain, fb_url)
  res.send(response)
}

export default handler
