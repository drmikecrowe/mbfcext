import { debug } from "debug"

import { Storage } from "@plasmohq/storage"

let browser
let devMode = false

const storage = new Storage()

try {
  // eslint-disable-next-line @typescript-eslint/no-extra-semi
  ;({ browser } = require("webextension-polyfill-ts"))
} catch (ex) {
  console.error(ex)
}

devMode = process.env.NODE_ENV === "development" || (browser && (!browser.runtime || !("update_url" in browser.runtime.getManifest())))

export const isDevMode = (): boolean => {
  return devMode
}

export const logger = (namespace: string) => {
  const log = debug(namespace)
  if (devMode) {
    return console.log // hack until I can get it to work
  }
  return log
}

if (devMode) {
  const log = logger("mbfc:logger")
  storage
    .set("debug", "mbfc:*")
    .then(() => log(`Setting debug mode`))
    .catch((err) => console.error(err))
}
