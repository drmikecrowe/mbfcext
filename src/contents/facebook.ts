import type { PlasmoContentScript } from "plasmo"

import { ConfigHandler } from "~utils"

export const config: PlasmoContentScript = {
  matches: ["https://facebook.com/*", "https://www.facebook.com/*"],
}

window.addEventListener("load", () => {
  console.log("content script loaded")
  ;(async () => {
    const config = await ConfigHandler.getInstance().retrieve()
    document.body.style.background = "pink"
  })().catch((err) => {
    console.error(err)
  })
})
