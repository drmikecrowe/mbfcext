import debug from "debug";
import { storage } from "..";
const log = debug("mbfc:messages:ResetIgnoredMessage");

import { browser, Runtime } from "webextension-polyfill-ts";

const ResetIgnoredMessageMethod = "ResetIgnoredMessage";

export class ResetIgnoredMessage {
    static method = ResetIgnoredMessageMethod;

    static async check(request: any, port: Runtime.Port): Promise<void> {
        try {
            const { method } = request;
            if (method === ResetIgnoredMessage.method) {
                const msg = new ResetIgnoredMessage();
                return msg.processMessage(port);
            }
        } catch (err) {}
        return Promise.resolve();
    }

    async processMessage(port: Runtime.Port): Promise<void> {
        await storage.hiddenSites.set({});
        log(`Sending message ResetIgnoredMessage response`, "OK");
        port.postMessage("OK");
    }

    async sendMessage(): Promise<void> {
        browser.runtime.sendMessage({
            method: ResetIgnoredMessage.method,
        });
    }
}
