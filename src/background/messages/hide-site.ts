import type { PlasmoMessaging } from "@plasmohq/messaging"

import { ConfigHandler, logger } from "~shared"

const log = logger("mbfc:background:messages:hide-site")

export const HIDE_SITE = "hide-site"

export type HideSiteRequestBody = {
  domain: string
  collapse: boolean
}

export type HideSiteResponseBody = {
  ok: boolean
}

const handler: PlasmoMessaging.MessageHandler<HideSiteRequestBody, HideSiteResponseBody> = async (req, res) => {
  const { domain, collapse } = req.body
  const ch = ConfigHandler.getInstance()
  const config = ch.config
  config.hiddenSites[domain] = collapse
  const action = config.hiddenSites[domain] ? "hidden" : "showing"
  log(`Domain ${domain} ${action} in the future`)
  log(config.hiddenSites)

  res.send({ ok: true })
  await ch.persist()
}

export default handler
