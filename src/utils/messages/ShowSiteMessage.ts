import debug from "debug";
import { GoogleAnalytics, ISource } from "..";
const log = debug("mbfc:messages:ShowSiteMessage");

import { browser, Runtime } from "webextension-polyfill-ts";

const ShowSiteMessageMethod = "ShowSiteMessage";

export class ShowSiteMessage {
    static method = ShowSiteMessageMethod;
    public source: ISource;
    public isAlias: boolean;
    public isBase: boolean;
    public isCollapsed: boolean;

    constructor(
        source: ISource,
        isAlias: boolean,
        isBase: boolean,
        isCollapsed: boolean
    ) {
        this.source = source;
        this.isAlias = isAlias;
        this.isBase = isBase;
        this.isCollapsed = isCollapsed;
    }

    static async check(request: any, port: Runtime.Port): Promise<void> {
        try {
            const { method, source, isAlias, isBase, isCollapsed } = request;
            if (method === ShowSiteMessage.method) {
                const msg = new ShowSiteMessage(
                    source,
                    isAlias,
                    isBase,
                    isCollapsed
                );
                return msg.processMessage(port);
            }
        } catch (err) {}
        return Promise.resolve();
    }

    async processMessage(port?: Runtime.Port): Promise<void> {
        GoogleAnalytics.getInstance().reportSite(
            this.source,
            this.isAlias,
            this.isBase,
            this.isCollapsed
        );
        if (port) {
            log(`Sending message ShowSiteMessage response`, "OK");
            port.postMessage("OK");
        }
    }

    async sendMessage(): Promise<void> {
        browser.runtime.sendMessage({
            method: ShowSiteMessage.method,
            source: this.source,
            isAlias: this.isAlias,
            isBase: this.isBase,
            isCollapsed: this.isCollapsed,
        });
    }
}
