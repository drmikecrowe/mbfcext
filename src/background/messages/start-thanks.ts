import type { PlasmoMessaging } from "@plasmohq/messaging"

import { logger } from "~shared/logger"

const log = logger("mbfc:background:messages:start-thanks")

export const START_THANKS = "start-thanks"

export type StartThanksRequestBody = {
  // void -- no call value
}

export type StartThanksResponseBody = {
  // void -- no return value
}

const handler: PlasmoMessaging.MessageHandler<StartThanksRequestBody, StartThanksResponseBody> = async (req, res) => {
  const response: StartThanksResponseBody = {}

  log(`Processing message StartThanksMessage response`)
  // TODO: We report that the popup was opened here to GA

  res.send(response)
}

export default handler
