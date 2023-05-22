import type { PlasmoCSConfig } from "plasmo"

import { ConfigHandler, logger } from "~shared"

import { Facebook } from "./content/facebook"

export const config: PlasmoCSConfig = {
  matches: ["https://facebook.com/*", "https://www.facebook.com/*"],
}

const log = logger("mbfc:contentscript:facebook")

window.addEventListener("load", () => {
  console.log("content script loaded")
  ;(async () => {
    await ConfigHandler.getInstance().retrieve()
    log(`Loaded into Facebook...`)
    Facebook.getInstance()
  })().catch((err) => {
    console.error(err)
  })
})
