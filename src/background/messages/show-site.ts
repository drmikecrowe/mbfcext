import type { PlasmoMessaging } from "@plasmohq/messaging"

import type { SiteModel } from "~models"
import { logger } from "~utils"

import { GoogleAnalytics } from "../utils/google-analytics"

const log = logger("mbfc:background:messages:show-site")

export const SHOW_SITE = "show-site"

export type ShowSiteRequestBody = {
  source: SiteModel
  collapse: boolean
}

export type ShowSiteResponseBody = {
  // void -- no return value
}

const handler: PlasmoMessaging.MessageHandler<ShowSiteRequestBody, ShowSiteResponseBody> = async (req, res) => {
  const { source, collapse } = req.body
  const response: ShowSiteResponseBody = {}

  log(`Processing ShowSiteMessage`)
  if (collapse) GoogleAnalytics.getInstance().reportCollapseSite(source.domain)
  else GoogleAnalytics.getInstance().reportShowSite(source.domain)

  res.send(response)
}

export default handler
