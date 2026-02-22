import { debug } from "debug"

import { Storage } from "@plasmohq/storage"

let devMode = false

devMode = process.env.NODE_ENV === "development" || !("update_url" in chrome.runtime.getManifest())

export const isDevMode = (): boolean => {
  return devMode
}

export const logger = (namespace: string) => {
  const log = debug(namespace)
  if (devMode) {
    debug.enable("mbfc:*")
  }
  return log
}

if (devMode) {
  const storage = new Storage()
  const log = logger("mbfc:logger")
  storage
    .set("debug", "mbfc:*")
    .then(() => log(`Setting debug mode`))
    .catch((err) => console.error(err))
}
