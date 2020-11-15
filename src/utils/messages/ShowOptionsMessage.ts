import { browser } from "webextension-polyfill-ts";
import { logger } from "utils";
import { messageUtil } from ".";

const log = logger("mbfc:messages:ShowOptionsMessage");

export class ShowOptionsMessage {
  static method = "ShowOptionsMessageMethod";

  static listen() {
    messageUtil.receive(ShowOptionsMessage.method, () => {
      try {
        const msg = new ShowOptionsMessage();
        return msg.processMessage();
      } catch (err) {}
    });
  }

  async processMessage(): Promise<void> {
    log(`Processing ShowOptionsMessage`);
    browser.runtime.openOptionsPage();
  }

  async sendMessage(toSelf = false): Promise<void> {
    if (toSelf) {
      messageUtil.sendSelf(ShowOptionsMessage.method, {});
    }
    await messageUtil.send(ShowOptionsMessage.method, {});
  }
}
