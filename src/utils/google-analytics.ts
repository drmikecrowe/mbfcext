import galite from "ga-lite";
import {
  ConfigHandler,
  GA,
  IConfig,
  isDevMode,
  ISource,
  logger,
  StorageHandler,
} from "utils";

const log = logger("mbfc:utils:google-analytics");

export class GoogleAnalytics {
  private static instance: GoogleAnalytics;

  static getInstance() {
    if (!GoogleAnalytics.instance) {
      GoogleAnalytics.instance = new GoogleAnalytics();
      log("GoogleAnalytics initialized");
      galite("create", GA, "auto");
    }
    return GoogleAnalytics.instance;
  }

  private config(): IConfig | undefined {
    const c = ConfigHandler.getInstance().config;
    if (c.isErr()) return;
    return c.value;
  }

  private allowed(): boolean {
    const config = this.config();
    if (config) return !config.mbfcBlockAnalytics;
    return false;
  }

  private async report(
    eventAction,
    eventLabel: string | undefined = undefined,
    eventValue: any | undefined = undefined
  ) {
    let msg = "Sending";
    if (this.allowed()) {
      if (isDevMode()) {
        msg = "DevMode, skipping";
      } else {
        msg = "Sending";
        galite("send", "event", eventAction, eventLabel, eventValue);
      }
    } else {
      msg = "not allowed";
    }
    log("REPORTING ", msg, eventAction, eventLabel, eventValue);
  }

  reportSite(
    source: ISource,
    isAlias: boolean,
    isBase: boolean,
    isCollapsed: boolean,
    isOmnibar?: boolean
  ) {
    if (!source) return;

    this.report("set", "isAlias", !!isAlias);
    this.report("set", "isBase", !!isBase);
    this.report("set", "collapsed", !!isCollapsed);
    this.report("set", "omnibar", !!isOmnibar);
    this.report("site", "shown", source.d);
    this.report("bias", "shown", source.b);
  }

  reportUnknown(domain: string) {
    const config = this.config();
    if (!config) return;
    if (!config.unknown[domain]) {
      config.unknown[domain] = true;
      this.report("site", "unknown", domain);
      return StorageHandler.getInstance().update(config);
    }
  }

  reportAssociated(url: string, fb_url: string) {
    this.report("associated", "set", `${url}=${fb_url}`);
  }

  reportHidingSite(action: string, domain: string) {
    this.report("hidingSite", action, domain);
  }
}
