import type { PlasmoMessaging } from "@plasmohq/messaging"

import { GoogleAnalytics } from "~background/utils/google-analytics"
import { logger } from "~shared"

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
