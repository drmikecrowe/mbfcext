import { browser } from "webextension-polyfill-ts";

export const devMode =
  process.env.NODE_ENV === "development" ||
  !browser.runtime ||
  !("update_url" in browser.runtime.getManifest());

if (devMode) {
  localStorage.debug = "mbfc:*";
}

// eslint-disable-next-line import/first
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

export * from "webextension-polyfill-ts";
export * from "./checkDomain";
export * from "./constants";
export * from "./definitions";
export * from "./getDomain";
export * from "./google-analytics";
export * from "./messages";
export * from "./poller";
export * from "./StorageHandler";
export * from "./utils";
export * from "./SourcesHandler";
export * from "./ConfigHandler";
export * from "./filters";
export * from "./tabUtils";
export * from "./elements";
