import { ISources, IConfig } from "..";
import debug from "debug";
const log = debug("mbfc:messages:UpdatedConfigMessage");

import { browser, Runtime } from "webextension-polyfill-ts";

const UpdatedConfigMessageMethod = "UpdatedConfigMessage";

export class UpdatedConfigMessage {
    static method = UpdatedConfigMessageMethod;
    public config: IConfig;
    public sources: ISources;

    constructor(config: IConfig, sources: ISources) {
        this.config = config;
        this.sources = sources;
    }

    static async check(request: any, port: Runtime.Port): Promise<void> {
        try {
            const { method, config, sources } = request;
            if (method === UpdatedConfigMessage.method) {
                const msg = new UpdatedConfigMessage(config, sources);
                return msg.processMessage(port);
            }
        } catch (err) {}
        return Promise.resolve();
    }

    async processMessage(port: Runtime.Port): Promise<void> {
        log(`Sending message UpdatedConfigMessage response`, "OK");
        port.postMessage("OK");
    }

    async sendMessage(): Promise<void> {
        browser.runtime.sendMessage({
            method: UpdatedConfigMessage.method,
            config: this.config,
            sources: this.sources,
        });
    }
}
