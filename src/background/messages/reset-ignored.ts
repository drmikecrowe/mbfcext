import type { PlasmoMessaging } from "@plasmohq/messaging"

import { GoogleAnalytics } from "~background/utils/google-analytics"
import { ConfigHandler, logger } from "~shared"

const log = logger("mbfc:background:messages:reset-ignored")

export const RESET_IGNORED = "reset-ignored"

export type ResetIgnoredRequestBody = {
  // void -- no call value
}

export type ResetIgnoredResponseBody = {
  // void -- no return value
}

const handler: PlasmoMessaging.MessageHandler<ResetIgnoredRequestBody, ResetIgnoredResponseBody> = async (req, res) => {
  const response: ResetIgnoredResponseBody = {}

  log(`Processing ResetIgnoredMessage`)
  const config = ConfigHandler.getInstance().config
  if (config) {
    config.hiddenSites = {}
    await Promise.allSettled([GoogleAnalytics.getInstance().reportResetIgnored(), ConfigHandler.getInstance().persist()])
  }
  res.send(response)
}

export default handler
