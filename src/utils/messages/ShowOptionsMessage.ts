import { logger } from "utils/logger";
import browser from "webextension-polyfill";

import { messageUtil } from "utils/messages/messageUtil";

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
