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
  IReportUnknownRequest,
  IAssociateSiteRequest,
  IShowSiteRequest,
  IHideSiteRequest,
} from "@/utils/messages";
import { SourcesProcessor } from "./sources";
import { GoogleAnalytics } from "@/utils/google-analytics";

export class MessageProcessor {
  private static instance: MessageProcessor;
  private constructor() {
    // do something construct...
  }
  static getInstance() {
    if (!MessageProcessor.instance) {
      MessageProcessor.instance = new MessageProcessor();
      log("MessageProcessor initialized");

      new GetConfigMessage(async (message: any) => {
        return await storage.get();
      });

      new ResetIgnoredMessage(async (message: any) => {
        await resetIgnored();
      });

      new ReloadConfigMessage(async (message: any) => {
        await SourcesProcessor.getInstance().retrieveRemote();
      });

      new ShowOptionsMessage((message: any) => {
        browser.runtime.openOptionsPage();
      });

      new StartThanksMessage((message: any) => {
        GoogleAnalytics.getInstance().report("thanks", "shown");
        // TODO
      });

      new ReportUnknownMessage((request: IReportUnknownRequest) => {
        GoogleAnalytics.getInstance().reportUnknown(request.domain);
      });

      new AssociateSiteMessage((request: IAssociateSiteRequest) => {
        GoogleAnalytics.getInstance().report("associatedSite", request.source.u, request.fb_url);
      });

      new ShowSiteMessage((request: IShowSiteRequest) => {
        GoogleAnalytics.getInstance().reportSite(request.source, request.isAlias, request.isBase, request.isCollapsed);
      });

      new HideSiteMessage(async (request: IHideSiteRequest) => {
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
    }
    return MessageProcessor.instance;
  }
}
