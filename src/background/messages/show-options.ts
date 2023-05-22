import type { PlasmoMessaging } from "@plasmohq/messaging"

import { logger } from "~shared/logger"

const log = logger("mbfc:background:messages:show-options")

export const SHOW_OPTIONS = "show-options"

export type ShowOptionsRequestBody = {
  // void -- no call value
}

export type ShowOptionsResponseBody = {
  // void -- no return value
}

const handler: PlasmoMessaging.MessageHandler<ShowOptionsRequestBody, ShowOptionsResponseBody> = async (req, res) => {
  const response: ShowOptionsResponseBody = {}

  log(`Processing ShowOptionsMessage`)
  chrome.runtime.openOptionsPage()

  res.send(response)
}

export default handler
