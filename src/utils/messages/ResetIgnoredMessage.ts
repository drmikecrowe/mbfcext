import { ConfigHandler } from "../ConfigHandler";
import { logger } from "../logger";
import { StorageHandler } from "../StorageHandler";
import { messageUtil } from "./messageUtil";

const log = logger("mbfc:messages:ResetIgnoredMessage");

export class ResetIgnoredMessage {
  static method = "ResetIgnoredMessageMethod";

  static listen() {
    messageUtil.receive(ResetIgnoredMessage.method, () => {
      try {
        const msg = new ResetIgnoredMessage();
        return msg.processMessage();
      } catch (err) {}
    });
  }

  async processMessage(): Promise<void> {
    log(`Processing ResetIgnoredMessage`);
    const c = ConfigHandler.getInstance().config;
    if (c.isErr()) return;
    const config = c.value;
    config.hiddenSites = {};
    await StorageHandler.getInstance().update(config);
  }

  async sendMessage(toSelf = false): Promise<void> {
    if (toSelf) {
      messageUtil.sendSelf(ResetIgnoredMessage.method, {});
    }
    await messageUtil.send(ResetIgnoredMessage.method, {});
  }
}
