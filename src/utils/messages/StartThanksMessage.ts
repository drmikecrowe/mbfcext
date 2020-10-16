import debug from "debug";
const log = debug("mbfc:messages:StartThanksMessage");

import { browser, Runtime } from "webextension-polyfill-ts";

const StartThanksMessageMethod = "StartThanksMessage";

export class StartThanksMessage {
    static method = StartThanksMessageMethod;

    static async check(request: any, port: Runtime.Port): Promise<void> {
        try {
            const { method } = request;
            if (method === StartThanksMessage.method) {
                const msg = new StartThanksMessage();
                return msg.processMessage(port);
            }
        } catch (err) {}
        return Promise.resolve();
    }

    async processMessage(port: Runtime.Port): Promise<void> {
        log(`Sending message StartThanksMessage response`, "OK");
        port.postMessage("OK");
    }

    async sendMessage(): Promise<void> {
        browser.runtime.sendMessage({
            method: StartThanksMessage.method,
        });
    }
}
