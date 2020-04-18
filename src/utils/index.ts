export {};
const log = require("debug")("mbfc:utils:index");

import { browser } from "webextension-polyfill-ts";

export * from "./options";
// export * from "./sites";
export * from "./utils";
export * from "./constants";
// export * from "./filters";
export * from "./storage";

export async function getPollMinutes(): Promise<number> {
  let minutes = 60;
  return minutes;
}

export const isDevMode = (): boolean => {
  const devMode = !browser.runtime || !("update_url" in browser.runtime.getManifest());
  if (devMode) {
    localStorage.debug = "ext*";
  }
  return devMode;
};
