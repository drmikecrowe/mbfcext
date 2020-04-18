export {};
const log = require("debug")("mbfc:utils:storage");

import { StorageArea } from "@spadin/webextension-storage";
import { IConfig } from "@/utils/definitions";

const config: IConfig = {
  aliases: {},
  reporting: {},
  hiddenSites: {},
  collapse: {},
  unknown: {},
  lastRun: 0,
  firstrun: true,
  loaded: false,
};

export var storage = StorageArea.create<IConfig>({
  defaults: config,
});

export const resetIgnored = async (): Promise<void> => {
  const config = await storage.get();
  config.hiddenSites = {};
  await Promise.all([storage.hiddenSites.set({})]);
  // await chromep.storage.local.set({ mbfchidden: config.hiddenSites });
  // await chromep.storage.sync.set({ "ignored_sites.reset_ignored": false });
};
