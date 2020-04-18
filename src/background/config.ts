export {};
const log = require("debug")("mbfc:background:config");

import { browser } from "webextension-polyfill-ts";
import { storage } from "@/utils/storage";
import { IConfig } from "@/utils/definitions";

browser.runtime.onInstalled.addListener(async (details) => {
  // Fill in default values for any unset settings.
  await storage.initDefaults();

  // A property is automatically created on the StorageArea object for each
  // setting with get(), set(), and other functions. Use addListener() to run
  // a function when a setting changes.
  storage.collapse.addListener((change, key) => {
    log(`collapse key changed from `, change.oldValue, " to ", change.newValue);
  });
});

export const getConfig = (): Promise<IConfig> => {
  return storage.get();
};
