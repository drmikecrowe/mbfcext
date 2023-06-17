import type { PlasmoCSConfig } from "plasmo"

import { ConfigHandler, logger } from "~shared"

import { Facebook } from "./content/facebook"

export {}

export const config: PlasmoCSConfig = {
  matches: ["https://facebook.com/*", "https://www.facebook.com/*"],
}

const log = logger("mbfc:contentscript:facebook")

const main = async () => {
  await ConfigHandler.getInstance().retrieve()
  log(`Loaded into Facebook...`)
  Facebook.getInstance()
}

main()
  .then((data?: any) => {
    if (data) console.log(data)
  })
  .catch((err: Error) => {
    console.error(err)
  })
