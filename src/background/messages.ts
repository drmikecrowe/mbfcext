import debug from "debug";
const log = debug("mbfc:background:messages");

import {
    browser,
    HideSiteMessage,
    GetConfigMessage,
    ResetIgnoredMessage,
    ReloadConfigMessage,
    ShowOptionsMessage,
    StartThanksMessage,
    ReportUnknownMessage,
    AssociateSiteMessage,
    ShowSiteMessage,
    UpdatedConfigMessage,
    BrowserMessage,
} from "utils";
import { Runtime } from "webextension-polyfill-ts";

export class MessageProcessor {
    private static instance: MessageProcessor;

    static getInstance(): MessageProcessor {
        if (!MessageProcessor.instance) {
            MessageProcessor.instance = new MessageProcessor();
            log("MessageProcessor initialized");
            browser.runtime.onConnect.addListener((p) => {
                log(`MessageProcessor connected: `, p);
                p.onMessage.addListener((m, port) => {
                    log(
                        "In background script, received message from content script",
                        m
                    );
                    MessageProcessor.getInstance()
                        .processMessage(m, port)
                        .then(() => log("Done"));
                });
            });
        }
        return MessageProcessor.instance;
    }

    async processMessage(
        request: BrowserMessage,
        port: Runtime.Port
    ): Promise<void> {
        await AssociateSiteMessage.check(request, port);
        await GetConfigMessage.check(request, port);
        await HideSiteMessage.check(request, port);
        await ReloadConfigMessage.check(request, port);
        await ReportUnknownMessage.check(request, port);
        await ResetIgnoredMessage.check(request, port);
        await ShowOptionsMessage.check(request, port);
        await ShowSiteMessage.check(request, port);
        await StartThanksMessage.check(request, port);
        await UpdatedConfigMessage.check(request, port);
    }
}
