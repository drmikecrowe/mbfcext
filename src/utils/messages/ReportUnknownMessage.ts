import { messageUtil } from "utils";
import { GoogleAnalytics } from "../google-analytics";
import { logger } from "utils";
const log = logger("mbfc:messages:ReportUnknownMessage");

export class ReportUnknownMessage {
    static method = "ReportUnknownMessageMethod";
    public domain = "";

    constructor(domain: string) {
        this.domain = domain;
    }

    static listen() {
        messageUtil.receive(ReportUnknownMessage.method, (request) => {
            try {
                const { domain } = request;
                const msg = new ReportUnknownMessage(domain);
                return msg.processMessage();
            } catch (err) {}
        });
    }

    async processMessage(): Promise<void> {
        log(`Processing ReportUnknownMessage`);
        GoogleAnalytics.getInstance().reportUnknown(this.domain);
    }

    async sendMessage(toSelf = false): Promise<void> {
        const params = {
            domain: this.domain,
        };
        if (toSelf) {
            messageUtil.sendSelf(ReportUnknownMessage.method, params);
        }
        await messageUtil.send(ReportUnknownMessage.method, params);
    }
}
