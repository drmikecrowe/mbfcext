import { browser, Runtime } from "webextension-polyfill-ts";
import debug from "debug";
import { SourcesProcessor } from "background/sources";
import { UpdatedConfigMessage } from ".";
import { storage } from "../storage";
const log = debug("mbfc:messages:GetConfigMessage");

const GetConfigMessageMethod = "GetConfigMessage";

export class GetConfigMessage {
    static method = GetConfigMessageMethod;

    static async check(request: any, port: Runtime.Port): Promise<void> {
        try {
            const { method } = request;
            if (method === GetConfigMessage.method) {
                const msg = new GetConfigMessage();
                return msg.processMessage(port);
            }
        } catch (err) {}
        return Promise.resolve();
    }

    async processMessage(port: Runtime.Port): Promise<void> {
        const [src, opt] = await Promise.all([
            SourcesProcessor.getInstance().getSources(),
            storage.collapse.get(),
        ]);
        log(`Sending message UpdatedConfigMessage response`, opt, src);
        port.postMessage(new UpdatedConfigMessage(opt, src));
    }

    async sendMessage(): Promise<void> {
        browser.runtime.sendMessage({
            method: GetConfigMessage.method,
        });
    }
}
