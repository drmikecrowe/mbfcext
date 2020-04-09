import { browser } from "webextension-polyfill-ts";
import get from "lodash/get";

export * from "./options";
export * from "./sites";
export * from "./utils";
export * from "./constants";
export * from "./filters";

const log = require("debug")("ext:utils");

export async function getSettings(item: string | null = null, deflt: any = {}) {
  const settings = await browser.storage.sync.get();
  log("settings", settings);
  if (item) {
    return get(settings, item, deflt);
  }
  return settings;
}

export async function setSettings(item: string, deflt: any) {
  log(`Setting (sync) ${item} = `, deflt);
  return await browser.storage.sync.set({ [item]: deflt });
}

export async function getStorage(item: string | null = null, deflt: any = {}) {
  const storage = await browser.storage.local.get();
  log("storage", storage);
  if (item) {
    return get(storage, item, deflt);
  }
  return storage;
}

export async function setStorage(item: string, deflt: any) {
  log(`Setting (local) ${item} = `, deflt);
  return await browser.storage.local.set({ [item]: deflt });
}

export async function getPollMinutes(): Promise<number> {
  const settings = await getSettings();
  let minutes = 60;
  const frequency = settings["notifications.frequency"];
  if (!frequency || frequency.indexOf(" ") === -1) return minutes;
  const parts = frequency.split(" ");
  minutes = parseInt(parts[0]);
  if (parts[1].startsWith("day")) {
    minutes = minutes * 60 * 60;
  } else if (parts[1].startsWith("hours")) {
    minutes = minutes * 60;
  }
  if (minutes < 2) minutes = 60;
  if (minutes < 15 && !isDevMode()) minutes = 60;
  return minutes;
}

export const isDevMode = (): boolean => {
  const devMode = !chrome.runtime || !("update_url" in chrome.runtime.getManifest());
  if (devMode) {
    localStorage.debug = "ext*";
  }
  return devMode;
};
