import { ConfigHandler } from "../utils/ConfigHandler";
import { ISources } from "../utils/definitions";
import { logger } from "../utils/logger";
import { GetConfigMessage } from "../utils/messages/GetConfigMessage";
import { messageUtil } from "../utils/messages/messageUtil";
import { UpdatedConfigMessage } from "../utils/messages/UpdatedConfigMessage";
import { UpdatedSourcesMessage } from "../utils/messages/UpdatedSourcesMessage";
import { SourcesHandler } from "../utils/SourcesHandler";
import { biasShortToName, IConfig } from "../utils/StorageHandler";
import { getCurrentTab, getSiteFromUrl } from "../utils/tabUtils";

const log = logger("mbfc:popup:InfoHandler");
// const { log } = console;

export class InfoHandler {
  bias = "";

  biasDescription = "";

  mbfcLink = "";

  rated = false;

  private static instance: InfoHandler;

  static getInstance() {
    if (!InfoHandler.instance) {
      log("new instance");
      InfoHandler.instance = new InfoHandler();
    }
    return InfoHandler.instance;
  }

  static async getConfig(): Promise<IConfig> {
    return new Promise((resolve) => {
      log("Requesting config");
      messageUtil.receive(UpdatedConfigMessage.method, (cfg: IConfig) => {
        log(`New config received`);
        resolve(cfg);
      });
      new GetConfigMessage().sendMessage();
    });
  }

  static async getSource(): Promise<ISources> {
    return new Promise((resolve) => {
      messageUtil.receive(UpdatedSourcesMessage.method, (sources: ISources) => {
        log(`New sources received`);
        resolve(sources);
      });
    });
  }

  async updateData() {
    ConfigHandler.getInstance();
    SourcesHandler.getInstance();
    const [_cfg, sources, res] = await Promise.all([
      InfoHandler.getConfig(),
      InfoHandler.getSource(),
      getCurrentTab(),
    ]);
    const tab = res.isOk() ? res.value : null;
    if (!tab || !tab.url) {
      log(`Error: No tab returned`);
      return;
    }
    const parsed_domain = getSiteFromUrl(tab.url);
    if (parsed_domain.isErr()) {
      log(`Error: Can't parse domain`);
      return;
    }
    const { site } = parsed_domain.value;
    if (!site) {
      log(`Error: No site returned`);
      return;
    }
    const { name, description } = sources.biases[biasShortToName[site.b]];
    this.bias = name;
    this.biasDescription = description;
    this.mbfcLink = `https://mediabiasfactcheck.com/${site.u}`;
    this.rated = true;
  }
}
