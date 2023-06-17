import type { PlasmoMessaging } from "@plasmohq/messaging"

import { ConfigHandler, logger } from "~shared"

const log = logger("mbfc:background:messages:reset-ignored")

export const RESET_IGNORED = "reset-ignored"

export type ResetIgnoredRequestBody = {
  // No body
}

export type ResetIgnoredResponseBody = {
  ok: boolean
}

const handler: PlasmoMessaging.MessageHandler<ResetIgnoredRequestBody, ResetIgnoredResponseBody> = async (req, res) => {
  const ch = ConfigHandler.getInstance()
  const config = ch.config
  config.hiddenSites = {}
  log(`All custom hidden sites now visible`)

  res.send({ ok: true })
  await ch.persist()
}

export default handler
