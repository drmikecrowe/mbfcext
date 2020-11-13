import { GoogleAnalytics, messageUtil, logger } from "utils";

import { ISource } from "../definitions";

const log = logger("mbfc:messages:AssociateSiteMessage");

export class AssociateSiteMessage {
    static method = "AssociateSiteMessageMethod";
    public source: ISource;
    public fb_url: string;

    constructor(source: ISource, fb_url: string) {
        this.source = source;
        this.fb_url = fb_url;
    }

    static listen() {
        messageUtil.receive(AssociateSiteMessage.method, (request) => {
            try {
                const { source, fb_url } = request;
                const msg = new AssociateSiteMessage(source, fb_url);
                msg.processMessage();
            } catch (err) {
                log("Incorrect method or error processing ", request);
            }
        });
    }

    async processMessage(): Promise<void> {
        log(
            `Processing AssociateSiteMessage ${this.source.u} = ${this.fb_url}`
        );
        GoogleAnalytics.getInstance().reportAssociated(
            this.source.u,
            this.fb_url
        );
    }

    async sendMessage(toSelf = false): Promise<void> {
        const params = {
            source: this.source,
            fb_url: this.fb_url,
        };
        if (toSelf) {
            messageUtil.sendSelf(AssociateSiteMessage.method, params);
        }
        await messageUtil.send(AssociateSiteMessage.method, params);
    }
}
