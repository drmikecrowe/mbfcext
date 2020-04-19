const log = require("debug")("mbfc:background:messages");
import { browser } from "webextension-polyfill-ts";
import { storage, resetIgnored } from "@/utils/storage";

import {
  HideSiteMessage,
  GetConfigMessage,
  ResetIgnoredMessage,
  ReloadConfigMessage,
  ShowOptionsMessage,
  StartThanksMessage,
  ReportUnknownMessage,
  AssociateSiteMessage,
  ShowSiteMessage,
  IEmptyMessageRequest,
} from "@/utils/messages";
import { SourcesProcessor } from "./sources";
import { GoogleAnalytics } from "@/utils/google-analytics";

export class MessageProcessor {
  private static instance: MessageProcessor;
  portFromCS: any;

  private constructor() {
    browser.runtime.onConnect.addListener(this.connected);
  }

  static getInstance() {
    if (!MessageProcessor.instance) {
      MessageProcessor.instance = new MessageProcessor();
      log("MessageProcessor initialized");
    }
    return MessageProcessor.instance;
  }

  connected(p) {
    log(`MessageProcessor connected: `, p);
    this.portFromCS = p;
    this.portFromCS.onMessage.addListener((m: any) => {
      log("In background script, received message from content script");
      MessageProcessor.getInstance().processMessage(m);
    });
  }

  processMessage(request: any) {
    GetConfigMessage.check(request, async (response) => {
      return await storage.get();
    });
    ResetIgnoredMessage.check(request, async (response) => {
      await resetIgnored();
    });
    ReloadConfigMessage.check(request, async (response) => {
      await SourcesProcessor.getInstance().retrieveRemote();
    });
    ShowOptionsMessage.check(request, (response) => {
      browser.runtime.openOptionsPage();
    });
    StartThanksMessage.check(request, (response) => {
      GoogleAnalytics.getInstance().report("thanks", "shown");
      // TODO
    });
    ReportUnknownMessage.check(request, (response) => {
      GoogleAnalytics.getInstance().reportUnknown(request.domain);
    });
    AssociateSiteMessage.check(request, (response) => {
      GoogleAnalytics.getInstance().report("associatedSite", request.source.u, request.fb_url);
    });
    HideSiteMessage.check(request, async (response) => {
      const hiddenSites = await storage.hiddenSites.get();
      hiddenSites[request.domain] = !hiddenSites[request.domain];
      const action = hiddenSites[request.domain] ? "hide" : "show";
      GoogleAnalytics.getInstance().report(action, "site", request.domain);
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
        response.isCollapsed,
      );
    });
  }
}
