import { GoogleAnalytics, logger } from "utils";

import { messageUtil } from ".";

const log = logger("mbfc:messages:StartThanksMessage");

export class StartThanksMessage {
  static method = "StartThanksMessageMethod";

  static listen() {
    messageUtil.receive(StartThanksMessage.method, () => {
      try {
        const msg = new StartThanksMessage();
        return msg.processMessage();
      } catch (err) {}
    });
  }

  async processMessage(): Promise<void> {
    log(`Processing message StartThanksMessage response`);
    // GoogleAnalytics.getInstance().
    // TODO: We report that the popup was opened here to GA
  }

  async sendMessage(toSelf = false): Promise<void> {
    log(`Sending StartThanksMessage`);
    if (toSelf) {
      messageUtil.sendSelf(StartThanksMessage.method, {});
    }
    await messageUtil.send(StartThanksMessage.method, {});
  }
}
