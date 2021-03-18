import { ConfigHandler } from "utils/ConfigHandler";

import { GoogleAnalytics } from "utils/google-analytics";
import { logger } from "utils/logger";
import { StorageHandler } from "utils/StorageHandler";
import { messageUtil } from "utils/messages/messageUtil";
import { UpdatedConfigMessage } from "utils/messages/UpdatedConfigMessage";

const log = logger("mbfc:messages:HideSiteMessage");

export class HideSiteMessage {
  static method = "HideSiteMessageMethod";
  public domain: string;
  public collapse: boolean;

  constructor(domain: string, collapse: boolean) {
    this.domain = domain;
    this.collapse = collapse;
  }
  static listen() {
    messageUtil.receive(HideSiteMessage.method, (request) => {
      try {
        const { domain, collapse } = request;
        const msg = new HideSiteMessage(domain, collapse);
        msg.processMessage();
      } catch (err) {}
    });
  }

  async processMessage(): Promise<void> {
    log(`Processing HideSiteMessage`);
    const storage = StorageHandler.getInstance();
    const c = ConfigHandler.getInstance().config;
    if (c.isErr()) return;
    const config = c.value;
    config.hiddenSites[this.domain] = this.collapse;
    const action = config.hiddenSites[this.domain] ? "hide" : "show";
    GoogleAnalytics.getInstance().reportHidingSite(action, this.domain);
    await Promise.all([storage.update(config), UpdatedConfigMessage.update()]);
  }

  async sendMessage(toSelf = false): Promise<void> {
    const params = {
      domain: this.domain,
      collapse: this.collapse,
    };
    if (toSelf) {
      messageUtil.sendSelf(HideSiteMessage.method, params);
    }
    await messageUtil.send(HideSiteMessage.method, params);
  }
}
