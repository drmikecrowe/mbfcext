import { err, ok, Result } from "neverthrow";

import { IConfig } from "../StorageHandler";
import { DefaultCollapse } from "utils/definitions";

export class ConfigHandler {
  private static instance: ConfigHandler;
  public config: Result<IConfig, null>;

  private rawConfig: IConfig = {
    hiddenSites: {},
    collapse: DefaultCollapse,
    unknown: {},
    lastRun: 0,
    firstrun: false,
    loaded: true,
    mbfcBlockAnalytics: true,
    pollMinutes: 60,
  };

  private constructor() {
    this.config = ok(this.rawConfig);
  }

  static getInstance() {
    if (!ConfigHandler.instance) {
      ConfigHandler.instance = new ConfigHandler();
    }
    return ConfigHandler.instance;
  }

  setConfig() {
    this.config = ok(this.rawConfig);
  }
}
