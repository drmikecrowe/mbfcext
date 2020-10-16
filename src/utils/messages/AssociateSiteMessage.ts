import { ISource } from "../definitions";
import { browser, Runtime } from "webextension-polyfill-ts";
import { GoogleAnalytics } from "utils";

import debug from "debug";
const log = debug("mbfc:messages:AssociateSiteMessage");

const AssociateSiteMessageMethod = "AssociateSiteMessage";

export class AssociateSiteMessage {
    static method = AssociateSiteMessageMethod;
    public source: ISource;
    public fb_url: string;

    constructor(source: ISource, fb_url: string) {
        this.source = source;
        this.fb_url = fb_url;
    }

    static async check(request: any, port: Runtime.Port): Promise<void> {
        try {
            const { method, source, fb_url } = request;
            if (method === AssociateSiteMessage.method) {
                const msg = new AssociateSiteMessage(source, fb_url);
                return msg.processMessage(port);
            }
        } catch (err) {
            log("Incorrect method or error processing ", request);
        }
        return Promise.resolve();
    }

    async processMessage(port: Runtime.Port): Promise<void> {
        GoogleAnalytics.getInstance().report(
            "associatedSite",
            this.source.u,
            this.fb_url
        );
        port.postMessage("OK");
    }

    async sendMessage(): Promise<void> {
        return browser.runtime.sendMessage({
            method: AssociateSiteMessage.method,
            source: this.source,
            fb_url: this.fb_url,
        });
    }
}
