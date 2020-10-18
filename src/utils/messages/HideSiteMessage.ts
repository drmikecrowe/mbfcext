import { GoogleAnalytics, messageUtil, StorageHandler } from "utils";
import { UpdatedConfigMessage } from "utils";
import { logger } from "utils";
import { ConfigHandler } from "utils/ConfigHandler";
const log = logger("mbfc:messages:HideSiteMessage");

export class HideSiteMessage {
    static method = "HideSiteMessageMethod";
    public domain: string;

    constructor(domain: string) {
        this.domain = domain;
    }
    static listen() {
        messageUtil.receive(HideSiteMessage.method, (request) => {
            try {
                const { domain } = request;
                const msg = new HideSiteMessage(domain);
                msg.processMessage();
            } catch (err) {}
        });
    }

    async processMessage(): Promise<void> {
        log(`Processing HideSiteMessage`);
        const storage = StorageHandler.getInstance();
        const _config = ConfigHandler.getInstance().config;
        if (_config.isErr()) return;
        const config = _config.value;
        config.hiddenSites[this.domain] = !config.hiddenSites[this.domain];
        const action = config.hiddenSites[this.domain] ? "hide" : "show";
        GoogleAnalytics.getInstance().reportHidingSite(action, this.domain);
        await Promise.all([
            storage.update(config),
            UpdatedConfigMessage.update(),
        ]);
    }

    async sendMessage(toSelf = false): Promise<void> {
        const params = {
            domain: this.domain,
        };
        if (toSelf) {
            messageUtil.sendSelf(HideSiteMessage.method, params);
        }
        messageUtil.send(HideSiteMessage.method, params);
    }
}
