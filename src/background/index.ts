import browser from "webextension-polyfill"

import { ConfigHandler, getDomain, isDevMode, logger } from "~shared"

import { SourcesProcessor } from "./sources-processor"
import { updateIcon } from "./update-icon"

export const log = logger("mbfc:background:index")

isDevMode()

// Use webextension-polyfill throughout — the chrome.* calls below are
// replaced so this works correctly on both Chrome and Firefox.
browser.tabs.onHighlighted.addListener(updateIcon)
browser.tabs.onActivated.addListener(updateIcon)
browser.tabs.onUpdated.addListener(updateIcon)
browser.windows.onFocusChanged.addListener(updateIcon)

/**
 * Handle toolbar icon clicks.
 *
 * On desktop Firefox and Chrome the popup defined in src/popup.tsx handles
 * the display, so this listener is never reached when a popup is registered.
 *
 * On Android Firefox there is no popup support, so the browser fires
 * browserAction.onClicked instead. We look up the current tab's domain,
 * then send a message to the mbfc-overlay content script running in that tab.
 */
browser.browserAction?.onClicked?.addListener(async (tab) => {
  if (!tab?.id || !tab.url) return

  const sp = SourcesProcessor.getInstance()
  const domain = getDomain(tab.url)

  // Ensure sources are loaded before we try to look anything up
  if (!sp.loaded) {
    await sp.getSourceData()
  }

  let payload = null

  if (sp.sourceData && domain?.domain && domain.domain in sp.sourceData.sites_by_domain) {
    const details = sp.sourceData.sites_by_domain[domain.domain]
    const bias = sp.sourceData.combined.biases.find((b) => b.bias === details.bias)
    if (bias) {
      payload = {
        bias: bias.pretty,
        biasDescription: bias.description,
        mbfcLink: details.url,
        rated: true,
      }
    }
  }

  try {
    await browser.tabs.sendMessage(tab.id, {
      type: "mbfc-show-overlay",
      payload: payload ?? { rated: false, bias: "", biasDescription: "", mbfcLink: "" },
    })
  } catch (e) {
    // Content script may not be injected on restricted pages (e.g. about:, chrome:)
    log("Could not send overlay message to tab", tab.id, e)
  }
})

Promise.all([SourcesProcessor.getInstance().getSourceData(), ConfigHandler.getInstance().retrieve()])
  .then(() => log("Main exited!"))
  .catch((e) => console.error(e))
