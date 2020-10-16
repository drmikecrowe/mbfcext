import { SourcesProcessor } from "background/sources";
import debug from "debug";
const log = debug("mbfc:messages:ReloadConfigMessage");

import { browser, Runtime } from "webextension-polyfill-ts";

const ReloadConfigMessageMethod = "ReloadConfigMessage";

export class ReloadConfigMessage {
    static method = ReloadConfigMessageMethod;

    static async check(request: any, port: Runtime.Port): Promise<void> {
        try {
            const { method } = request;
            if (method === ReloadConfigMessage.method) {
                const msg = new ReloadConfigMessage();
                return msg.processMessage(port);
            }
        } catch (err) {}
        return Promise.resolve();
    }

    async processMessage(port: Runtime.Port): Promise<void> {
        const sources = await SourcesProcessor.getInstance().retrieveRemote();
        log(`Sending message ReloadConfigMessage response`, sources);
        port.postMessage(sources);
    }

    async sendMessage(): Promise<void> {
        browser.runtime.sendMessage({
            method: ReloadConfigMessage.method,
        });
    }
}
