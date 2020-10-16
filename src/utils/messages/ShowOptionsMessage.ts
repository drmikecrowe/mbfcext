import debug from "debug";
const log = debug("mbfc:messages:ShowOptionsMessage");

import { browser, Runtime } from "webextension-polyfill-ts";

const ShowOptionsMessageMethod = "ShowOptionsMessage";

export class ShowOptionsMessage {
    static method = ShowOptionsMessageMethod;

    static async check(request: any, port: Runtime.Port): Promise<void> {
        try {
            const { method } = request;
            if (method === ShowOptionsMessage.method) {
                const msg = new ShowOptionsMessage();
                return msg.processMessage(port);
            }
        } catch (err) {}
        return Promise.resolve();
    }

    async processMessage(port: Runtime.Port): Promise<void> {
        browser.runtime.openOptionsPage();
        log(`Sending message ShowOptionsMessage response`, "OK");
        port.postMessage("OK");
    }

    async sendMessage(): Promise<void> {
        browser.runtime.sendMessage({
            method: ShowOptionsMessage.method,
        });
    }
}
