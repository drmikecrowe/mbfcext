import { browser, Runtime } from "webextension-polyfill-ts";

import debug from "debug";
import { storage, GoogleAnalytics } from "utils";
const log = debug("mbfc:messages:HideSiteMessage");

const HideSiteMessageMethod = "HideSiteMessage";

export class HideSiteMessage {
    static method = HideSiteMessageMethod;
    public domain: string;

    constructor(domain: string) {
        this.domain = domain;
    }

    static async check(request: any, port: Runtime.Port): Promise<void> {
        try {
            const { method, domain } = request;
            if (method === HideSiteMessage.method) {
                const msg = new HideSiteMessage(domain);
                return msg.processMessage(port);
            }
        } catch (err) {}
        return Promise.resolve();
    }

    async processMessage(port: Runtime.Port): Promise<void> {
        const hiddenSites = await storage.hiddenSites.get();
        hiddenSites[this.domain] = !hiddenSites[this.domain];
        const action = hiddenSites[this.domain] ? "hide" : "show";
        GoogleAnalytics.getInstance().report(action, "site", this.domain);
        await storage.hiddenSites.set(hiddenSites);
        // TODO: How do we do this now?
        // chromep.storage.local.set({ mbfchidden: config.hiddenSites }).then(function () {
        //   log("Resetting hidden to: ", config.hiddenSites);
        // });
        // return config.hiddenSites[request.domain];
        log(`Sending message HideSiteMessage response`, "OK");
        port.postMessage("OK");
    }

    async sendMessage(): Promise<void> {
        browser.runtime.sendMessage({
            method: HideSiteMessage.method,
            domain: this.domain,
        });
    }
}
