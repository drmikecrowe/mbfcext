import type { PlasmoMessaging } from "@plasmohq/messaging"

import { logger } from "~utils"

import { GoogleAnalytics } from "../utils/google-analytics"

const log = logger("mbfc:background:messages:report-unknown")

export const REPORT_UNKNOWN = "report-unknown"

export type ReportUnknownRequestBody = {
  domain: string
}

export type ReportUnknownResponseBody = {
  // void -- no return value
}

const handler: PlasmoMessaging.MessageHandler<ReportUnknownRequestBody, ReportUnknownResponseBody> = async (req, res) => {
  const { domain } = req.body
  const response: ReportUnknownResponseBody = {}

  log(`Processing ReportUnknownMessage`)
  GoogleAnalytics.getInstance().reportUnknownSite(domain)

  res.send(response)
}

export default handler
