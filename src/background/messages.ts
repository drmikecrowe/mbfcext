const log = require("debug")("mbfc:background:messages");

import { get } from "lodash-es";
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
    GoogleAnalytics,
    storage,
    BrowserMessage,
} from "utils";
import { SourcesProcessor } from "./sources";

export class MessageProcessor {
    private static instance: MessageProcessor;

    static getInstance() {
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
                    MessageProcessor.getInstance().processMessage(m, port);
                });
            });
        }
        return MessageProcessor.instance;
    }

    processMessage(request: BrowserMessage, port: any = null): void {
        GetConfigMessage.check(request, async () => {
            const [src, opt] = await Promise.all([
                SourcesProcessor.getInstance().getSources(),
                storage.collapse.get(),
            ]);
            const postMessage = get(port, "postMessage", () => {});
            postMessage(new UpdatedConfigMessage(opt, src));
        });
        ResetIgnoredMessage.check(request, async () => {
            await storage.hiddenSites.set({});
        });
        ReloadConfigMessage.check(request, async () => {
            const sources = await SourcesProcessor.getInstance().retrieveRemote();
            const postMessage = get(port, "postMessage", () => {});
            postMessage(sources);
        });
        ShowOptionsMessage.check(request, () => {
            browser.runtime.openOptionsPage();
        });
        StartThanksMessage.check(request, () => {
            GoogleAnalytics.getInstance().report("thanks", "shown");
            // TODO
        });
        ReportUnknownMessage.check(request, () => {
            const rum: ReportUnknownMessage = request;
            GoogleAnalytics.getInstance().reportUnknown(rum.domain);
        });
        AssociateSiteMessage.check(request, () => {
            GoogleAnalytics.getInstance().report(
                "associatedSite",
                request.source.u,
                request.fb_url
            );
        });
        HideSiteMessage.check(request, async () => {
            const hiddenSites = await storage.hiddenSites.get();
            hiddenSites[request.domain] = !hiddenSites[request.domain];
            const action = hiddenSites[request.domain] ? "hide" : "show";
            GoogleAnalytics.getInstance().report(
                action,
                "site",
                request.domain
            );
            await storage.hiddenSites.set(hiddenSites);
            // TODO: How do we do this now?
            // chromep.storage.local.set({ mbfchidden: config.hiddenSites }).then(function () {
            //   log("Resetting hidden to: ", config.hiddenSites);
            // });
            // return config.hiddenSites[request.domain];
        });
        ShowSiteMessage.check(request, (response) => {
            GoogleAnalytics.getInstance().reportSite(
                response.source,
                response.isAlias,
                response.isBase,
                response.isCollapsed
            );
        });
    }
}
