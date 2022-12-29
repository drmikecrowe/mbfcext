import { onMessage, sendMessage } from "webext-bridge"
import type { PopupDetails } from "~popup"

import { SourcesProcessor } from "./background/sources-processor"
import { isDevMode, logger } from "./utils/logger"

const log = logger("mbfc:background:index")
const main = async () => {
  isDevMode()
  await SourcesProcessor.getInstance().getSourceData()
}

onMessage("get-domain", ({ data }) => {
  const { domain } = data
  const sp = SourcesProcessor.getInstance()
  log(`Domain ${domain} requested`)
  if (sp.sourceData && sp.sourceData.loaded) {
    log(`Domain ${domain} found`)
    return sp.sourceData.sites_by_domain[domain]
  } else {
    log(`Domains not loaded `)
  }
})

onMessage("get-domain-for-tab", ({ data }) => {
  const { domain } = data
  const sp = SourcesProcessor.getInstance()
  log(`Domain ${domain} requested`)
  if (sp.sourceData && sp.sourceData.loaded) {
    if (domain in sp.sourceData.sites_by_domain) {
      log(`Domain ${domain} found`)
      const details = sp.sourceData.sites_by_domain[domain]
      const bias = sp.sourceData.combined.biases.find((b) => b.bias === details.bias)
      const ret: PopupDetails = {
        bias: bias.pretty,
        biasDescription: bias.description,
        mbfcLink: details.url,
        rated: true,
      }
      return ret
    }
    return undefined
  } else {
    log(`Domains not loaded `)
  }
})

let previousTabId = 0

onMessage("get-current-tab", async () => {
  try {
    const tab = await chrome.tabs.get(previousTabId)
    return {
      title: tab?.url,
    }
  } catch {
    return {
      title: undefined,
    }
  }
})

// while (true) {
main()
  .then(() => log("Main exited!"))
  .catch((e) => console.error(e))
// }
