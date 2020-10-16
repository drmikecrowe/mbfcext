import debug from "debug";
import { GoogleAnalytics } from "../google-analytics";
const log = debug("mbfc:messages:ReportUnknownMessage");

import { browser, Runtime } from "webextension-polyfill-ts";

const ReportUnknownMessageMethod = "ReportUnknownMessage";

export class ReportUnknownMessage {
    static method = ReportUnknownMessageMethod;
    public domain = "";

    constructor(domain: string) {
        this.domain = domain;
    }

    static async check(request: any, port: Runtime.Port): Promise<void> {
        try {
            const { method, domain } = request;
            if (method === ReportUnknownMessage.method) {
                const msg = new ReportUnknownMessage(domain);
                return msg.processMessage(port);
            }
        } catch (err) {}
        return Promise.resolve();
    }

    async processMessage(port: Runtime.Port): Promise<void> {
        GoogleAnalytics.getInstance().reportUnknown(this.domain);
        log(`Sending message ReportUnknownMessage response`, "OK");
        port.postMessage("OK");
    }

    async sendMessage(): Promise<void> {
        browser.runtime.sendMessage({
            method: ReportUnknownMessage.method,
            domain: this.domain,
        });
    }
}
