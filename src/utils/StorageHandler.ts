/* eslint-disable no-shadow */
import { set } from "lodash";
import { browser } from "utils/browser";
import { OPTIONS_FIRST_RUN } from "utils/constants";
import { logger } from "utils/logger";
import OptionsSync, { Options } from "webext-options-sync";

import { UpdatedConfigMessage } from "utils/messages/UpdatedConfigMessage";
import { Collapse, DefaultCollapse } from "utils/definitions";

const log = logger("mbfc:utils:StorageHandler");

export type HiddenSites = Record<string, boolean>;
export type UnknownSites = Record<string, boolean>;

export interface IConfig {
  hiddenSites: HiddenSites;
  collapse: Collapse;
  unknown: UnknownSites;
  lastRun: number;
  firstrun: boolean;
  loaded: boolean;
  mbfcBlockAnalytics: boolean;
  pollMinutes: number;
}

const configDefaults: IConfig = {
  hiddenSites: {},
  collapse: DefaultCollapse,
  unknown: {},
  lastRun: 0,
  firstrun: true,
  loaded: false,
  mbfcBlockAnalytics: false,
  pollMinutes: 60,
};

const configToOptions = (obj: any): Options => {
  const opt: Options = {};

  const walk = (o: any, path: string[]) => {
    Object.entries(o).forEach(([n, v]) => {
      if (typeof v === "object" || v instanceof Array) {
        walk(v, [...path, n]);
      } else {
        set(opt, [...path.slice(1), n], v);
      }
    });
  };
  walk(obj, ["tree"]);
  return opt;
};

const optionsToConfig = (obj: Options): IConfig => {
  const cfg: IConfig = configDefaults;
  Object.entries(obj).forEach(([key, val]) => {
    const parts = key.split(".");
    const category = parts.shift();
    if (!category) return;
    const keys = [category];
    if (parts.length) keys.push(parts.join("."));
    set(cfg, keys, val);
  });
  return cfg;
};

export class StorageHandler {
  private static instance: StorageHandler;
  private optionsStorage: OptionsSync<Options>;

  private constructor() {
    this.optionsStorage = new OptionsSync({
      defaults: configToOptions(configDefaults),
    });
    browser.storage.onChanged.addListener(StorageHandler.onChanged);
  }

  static getInstance() {
    if (!StorageHandler.instance) {
      StorageHandler.instance = new StorageHandler();
    }
    return StorageHandler.instance;
  }

  private static async onChanged() {
    log(`Storage changed!`);
    const so = StorageHandler.getInstance();
    const opt = await so.optionsStorage.getAll();
    const config = optionsToConfig(opt);
    const msg = new UpdatedConfigMessage(config);
    msg.sendMessage(true);
  }

  public async update(cfg: IConfig) {
    await this.optionsStorage.set(configToOptions(cfg));
  }

  public async getConfig(): Promise<IConfig> {
    const opt = await this.optionsStorage.getAll();
    const config = optionsToConfig(opt);
    if (config.firstrun) {
      config.firstrun = false;
      await this.update(config);
      if (OPTIONS_FIRST_RUN) browser.runtime.openOptionsPage();
    } else {
      const msg = new UpdatedConfigMessage(config);
      msg.sendMessage(true);
    }
    return config;
  }
}
