import { ConfigHandler, isDevMode, logger } from "~shared"

import { SourcesProcessor } from "./sources-processor"
import { updateIcon } from "./update-icon"

export const log = logger("mbfc:background:index")

isDevMode()
chrome.tabs.onHighlighted.addListener(updateIcon)
chrome.tabs.onActivated.addListener(updateIcon)
chrome.tabs.onUpdated.addListener(updateIcon)
chrome.windows.onFocusChanged.addListener(updateIcon)

Promise.all([SourcesProcessor.getInstance().getSourceData(), ConfigHandler.getInstance().retrieve()])
  .then(() => log("Main exited!"))
  .catch((e) => console.error(e))
