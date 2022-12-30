import { onMessage } from "webext-bridge"

import { TabListener } from "~background/tab-listenener"
import type { PopupDetails } from "~popup"
import { BiasEnums, ConfigHandler, getCurrentTab, getSiteFromUrl } from "~utils"

import { SourcesProcessor } from "./background/sources-processor"
import { isDevMode, logger } from "./utils/logger"

const log = logger("mbfc:background:index")
const main = async () => {
  isDevMode()
  await Promise.all([SourcesProcessor.getInstance().getSourceData(), ConfigHandler.getInstance().retrieve()])
  chrome.tabs.onHighlighted.addListener(badgeUpdater)
  chrome.tabs.onActivated.addListener(badgeUpdater)
  chrome.tabs.onUpdated.addListener(badgeUpdater)
  chrome.windows.onFocusChanged.addListener(badgeUpdater)
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

async function badgeUpdater(): Promise<void> {
  const tl = TabListener.getInstance()
  const res = await getCurrentTab()
  const tab = res.isOk() ? res.value : null
  if (!tab) return
  if (tab.url && tab.id && !tab.incognito) {
    const parsed_domain = getSiteFromUrl(tab.url)
    if (parsed_domain.isErr()) {
      tl.resetIcon(tab.id)
      return
    }
    const { site, collapse } = parsed_domain.value
    const { bias } = site
    if (!(bias in BiasEnums)) {
      return this.resetIcon(tab.id)
    }
    tl.updateIcon(bias, collapse, tab.id)
  } else {
    tl.resetIcon(tab.id)
  }
}

// while (true) {
main()
  .then(() => log("Main exited!"))
  .catch((e) => console.error(e))
// }
