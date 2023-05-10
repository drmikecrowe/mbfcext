import type { PlasmoMessaging } from "@plasmohq/messaging"

import { ConfigHandler, logger } from "~utils"

import { GoogleAnalytics } from "../utils/google-analytics"

const log = logger("mbfc:background:messages:hide-site")

export const HIDE_SITE = "hide-site"

export type HideSiteRequestBody = {
  domain: string
  collapse: boolean
}

export type HideSiteResponseBody = {
  // void -- no return value
}

const handler: PlasmoMessaging.MessageHandler<HideSiteRequestBody, HideSiteResponseBody> = async (req, res) => {
  const { domain, collapse } = req.body
  const response: HideSiteResponseBody = {}

  log(`Processing HideSiteMessage`)
  const config = ConfigHandler.getInstance().config
  config.hiddenSites[domain] = collapse
  if (collapse) {
    GoogleAnalytics.getInstance().reportHidingSite(domain)
  } else {
    GoogleAnalytics.getInstance().reportUnhidingSite(domain)
  }
  res.send(response)
}

export default handler
