import { debug } from "debug"

/* eslint-disable prettier/prettier */
let browser

try {
  // eslint-disable-next-line @typescript-eslint/no-extra-semi
  ;({ browser } = require("webextension-polyfill-ts"))
} catch (ex) {}

export const devMode = process.env.NODE_ENV === "development" || (browser && (!browser.runtime || !("update_url" in browser.runtime.getManifest())))

if (devMode && browser) {
  localStorage.debug = "mbfc:*"
}

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
