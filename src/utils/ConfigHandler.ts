import { err, ok, Result } from "neverthrow";

import { logger } from "./logger";
import { messageUtil } from "./messages/messageUtil";
import { UpdatedConfigMessage } from "./messages/UpdatedConfigMessage";
import { IConfig } from "./StorageHandler";

const log = logger("mbfc:utils:ConfigHandler");

export class ConfigHandler {
  private static instance: ConfigHandler;
  public config: Result<IConfig, null>;

  private constructor() {
    log(`Initializing ConfigHandler`);
    this.config = err(null);
    messageUtil.receive(UpdatedConfigMessage.method, (cfg: IConfig) => {
      log(`New config received`);
      this.config = ok(cfg);
    });
  }

  static getInstance() {
    if (!ConfigHandler.instance) {
      ConfigHandler.instance = new ConfigHandler();
    }
    return ConfigHandler.instance;
  }
}
