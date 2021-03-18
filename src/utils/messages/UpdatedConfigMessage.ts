import { ConfigHandler } from "utils/ConfigHandler";
import { logger } from "utils/logger";
import { IConfig } from "utils/StorageHandler";
import { messageUtil } from "utils/messages/messageUtil";

const log = logger("mbfc:messages:UpdatedConfigMessage");

export class UpdatedConfigMessage {
  static method = "UpdatedConfigMessageMethod";
  public config: IConfig;

  constructor(config: IConfig) {
    this.config = config;
  }

  static async update(): Promise<void> {
    const c = ConfigHandler.getInstance().config;
    if (c.isErr()) return;
    const cfg = c.value;
    const msg = new UpdatedConfigMessage(cfg);
    await msg.sendMessage(true);
  }

  async sendMessage(toSelf = false): Promise<void> {
    log(`Sending UpdatedConfigMessage `, this.config);
    if (toSelf) {
      messageUtil.sendSelf(UpdatedConfigMessage.method, this.config);
    }
    await messageUtil.send(UpdatedConfigMessage.method, this.config);
  }
}
