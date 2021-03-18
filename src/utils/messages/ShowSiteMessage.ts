import { ISource } from "../definitions";
import { GoogleAnalytics } from "../google-analytics";
import { logger } from "../logger";
import { messageUtil } from "./messageUtil";

const log = logger("mbfc:messages:ShowSiteMessage");

export class ShowSiteMessage {
  static method = "ShowSiteMessageMethod";
  public source: ISource;
  public isAlias: boolean;
  public isBase: boolean;
  public isCollapsed: boolean;

  constructor(
    source: ISource,
    isAlias: boolean,
    isBase: boolean,
    isCollapsed: boolean
  ) {
    this.source = source;
    this.isAlias = isAlias;
    this.isBase = isBase;
    this.isCollapsed = isCollapsed;
  }

  static listen() {
    messageUtil.receive(ShowSiteMessage.method, (request) => {
      try {
        const { source, isAlias, isBase, isCollapsed } = request;
        const msg = new ShowSiteMessage(source, isAlias, isBase, isCollapsed);
        return msg.processMessage();
      } catch (err) {}
    });
  }

  async processMessage(): Promise<void> {
    log(`Processing ShowSiteMessage`);
    GoogleAnalytics.getInstance().reportSite(
      this.source,
      this.isAlias,
      this.isBase,
      this.isCollapsed
    );
  }

  async sendMessage(toSelf = false): Promise<void> {
    const params = {
      source: this.source,
      isAlias: this.isAlias,
      isBase: this.isBase,
      isCollapsed: this.isCollapsed,
    };
    if (toSelf) {
      messageUtil.sendSelf(ShowSiteMessage.method, params);
    }
    await messageUtil.send(ShowSiteMessage.method, params);
  }
}
