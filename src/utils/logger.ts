let browser;

try {
  ({ browser } = require("webextension-polyfill-ts"));
} catch (ex) {}

export const devMode =
  process.env.NODE_ENV === "development" ||
  (browser &&
    (!browser.runtime || !("update_url" in browser.runtime.getManifest())));

if (devMode && browser) {
  localStorage.debug = "mbfc:*";
}

import { debug } from "debug";

export const isDevMode = (): boolean => {
  return devMode;
};

export const logger = (namespace: string) => {
  const log = debug(namespace);
  if (devMode) {
    return console.log; // hack until I can get it to work
  }
  return log;
};
