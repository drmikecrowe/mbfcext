import { debug } from "debug"

let devMode = false

devMode = process.env.NODE_ENV === "development" || !("update_url" in chrome.runtime.getManifest())

// Enable debug mode for all mbfc namespaces BEFORE any loggers are created
if (devMode) {
  debug.enable("mbfc:*")
}

export const isDevMode = (): boolean => {
  return devMode
}

export const logger = (namespace: string) => {
  return debug(namespace)
}

// Log that debug mode is enabled (after exports so loggers can be created)
if (devMode) {
  const log = logger("mbfc:logger")
  log("Debug mode enabled for mbfc:*")
}
