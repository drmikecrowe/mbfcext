export {};
const log = require("debug")("mbfc:utils:google-analytics");

import { GA } from "./constants";
import galite from "ga-lite";
import { storage } from "./storage";
import { isDevMode } from "./utils";
import { ISource } from "./definitions";

export class GoogleAnalytics {
  private static instance: GoogleAnalytics;
  private constructor() {
    // do something construct...
  }
  static getInstance() {
    if (!GoogleAnalytics.instance) {
      GoogleAnalytics.instance = new GoogleAnalytics();
      log("GoogleAnalytics initialized");
      galite("create", GA, "auto");
    }
    return GoogleAnalytics.instance;
  }
  //someMethod() { }

  async report(eventAction, eventLabel: string | undefined = undefined, eventValue: any | undefined = undefined) {
    if (eventAction !== "set") log("REPORTING: ", eventAction, eventLabel, eventValue);
    let gaAllowed = true; // TODO: fix
    if (gaAllowed) {
      if (isDevMode()) {
        return;
      }
      if (ga) {
        ga("send", "event", eventAction, eventLabel, eventValue);
      } else {
        log("NO ga LOADED");
      }
    } else {
      log("REPORTING not allowed");
    }
  }

  async reportUnknown(domain: string) {
    let unknown = await storage.unknown.get();
    if (!unknown[domain]) {
      unknown[domain] = true;
      await storage.unknown.set(unknown);
      this.report("site", "unknown", domain);
    }
  }

  reportSite(source: ISource, isAlias: boolean, isBase: boolean, isCollapsed: boolean, isOmnibar?: boolean) {
    if (!source) return;

    this.report("set", "isAlias", !!isAlias);
    this.report("set", "isBase", !!isBase);
    this.report("set", "collapsed", !!isCollapsed);
    this.report("set", "omnibar", !!isOmnibar);
    this.report("site", "shown", source.d);
    this.report("bias", "shown", source.b);
  }
}
