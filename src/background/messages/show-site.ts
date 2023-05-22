import type { PlasmoMessaging } from "@plasmohq/messaging"

import { GoogleAnalytics } from "~background/utils/google-analytics"
import type { SiteModel } from "~models"
import { logger } from "~shared"

const log = logger("mbfc:background:messages:show-site")

export const SHOW_SITE = "show-site"

export type ShowSiteRequestBody = {
  source: SiteModel
  collapse: boolean
}

export type ShowSiteResponseBody = boolean

const handler: PlasmoMessaging.MessageHandler<ShowSiteRequestBody, ShowSiteResponseBody> = async (req, res) => {
  const { source, collapse } = req.body

  log(`Processing ShowSiteMessage`)
  if (collapse) GoogleAnalytics.getInstance().reportCollapseSite(source.domain)
  else GoogleAnalytics.getInstance().reportShowSite(source.domain)

  res.send(true)
}

export default handler
