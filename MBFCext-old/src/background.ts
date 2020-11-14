import chromep from "chrome-promise";
import debug from "debug";
import { BASE, isDevMode } from "./utils";
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
} from "./messages";
import { IConfig, ISource } from "./utils/definitions";
import { addGoogleAnalytics } from "./utils/google-analytics";
import { TabListener } from "./utils/tabListener";
import { getCurrentTab } from "./utils/getCurrentTab";

const devMode = isDevMode();
const log = debug("mbfc:background");

let gaLoaded = false;
let gaAllowed = false;
let tabs = null;
let force_remote = false;

const config: IConfig = {
  sources: {},
  biases: {},
  aliases: {},
  reporting: {},
  hiddenSites: {},
  collapse: {},
  fb_pages: {},
  tw_pages: {},
  unknown: {},
  loaded: false,
};

function getFile(type: string): Promise<any> {
  return new Promise(function(resolve, reject) {
    let xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
      if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
        let js = JSON.parse(xhr.responseText);
        let date = new Date();
        date.setDate(date.getDate() + 1);
        if (type == "csources") {
          type = "sources";
        }
        let obj = {};
        obj[type] = js;
        obj["expires2"] = date.getTime();
        log(type + " " + Object.keys(js).length + " items retrieved from server, saving to local storage with expires of ", date);
        chromep.storage.local.set(obj).then(function() {
          return resolve(js);
        });
      }
    };
    if (type == "sources") {
      type = "csources";
    }
    let fname = BASE + type + ".json";
    xhr.open("GET", fname, true);
    xhr.send();
  });
}

async function getStorage(type: string | null): Promise<any> {
  const dict = await chromep.storage.local.get(type);
  if (typeof dict == "object") {
    log((type || "(all)") + " config: " + Object.keys(dict).length + " items retrieved from storage");
    if (!type) {
      return dict; // getting all settings
    }
    return dict[type];
  }
  return dict;
}

async function getStorageOrFile(type: string): Promise<any> {
  if (devMode) {
    return getFile(type);
  }
  const dict = await chromep.storage.local.get(type);
  if (dict) {
    if (dict[type]) {
      let now = new Date();
      let future = new Date();
      future.setDate(future.getHours() + 12);
      let stored_time = dict.expires2 || 0;
      if (!force_remote && stored_time >= now.getTime() && stored_time <= future.getTime()) {
        log("Using " + type + " from local storage");
        return dict[type];
      } else {
        log(type + " is old, getting new one");
      }
    }
  }
  log(type + " not in local storage, requesting up-to-date version");
  return getFile(type);
}

function setupGoogleAnalytics() {
  if (gaLoaded) {
    return Promise.resolve();
  }
  gaLoaded = true;
  if (!config["privacy_settings.mbfcanalytics_disabled"]) {
    log("Loading analytics");
    gaAllowed = true;
    if (!devMode) {
      addGoogleAnalytics();
    }
  } else {
    log("Analytics disabled");
  }
}

/*
   collapse.collapse-conspiracy
   collapse.collapse-fake-news
   collapse.collapse-left
   collapse.collapse-pro-science
   collapse.collapse-right
   privacy_settings.mbfcanalytics_disabled
   */
function setCollapsed(dict) {
  Object.keys(dict).forEach(function(key) {
    if (key.startsWith("collapse.")) {
      config.collapse[key.substring(18)] = dict[key];
      log((config.collapse[key.substring(18)] ? "Collapsing " : "Showing ") + key.substring(18));
    }
  });
}

class LoadSettingsProcessor {
  private static instance: LoadSettingsProcessor;
  private loading: boolean = false;
  private loadSettingsPromise: Promise<IConfig> = null;

  static getInstance() {
    if (!LoadSettingsProcessor.instance) {
      LoadSettingsProcessor.instance = new LoadSettingsProcessor();
      chromep.storage.local.get().then(js => log(js));
      chromep.storage.sync.get().then(js => log(js));
    }
    return LoadSettingsProcessor.instance;
  }

  async get(force = false) {
    const combined = force ? getFile("combined") : getStorageOrFile("combined");
    let todo = [combined, getStorage("mbfchidden"), chromep.storage.sync.get()];
    log(`Loading setting ${force ? "(forced)" : ""}`);
    try {
      const [combined, hiddenSites, all] = await Promise.all(todo);
      log("Settings retrieved, processing");
      Object.keys(combined).forEach(key => Object.assign(config[key], combined[key]));
      if (!config.biases["left-center"]) {
        config.biases["left-center"] = config.biases["leftcenter"];
      }
      Object.assign(config.hiddenSites, hiddenSites || {});
      Object.keys(all).forEach(function(key) {
        config[key] = all[key];
      });
      Object.keys(config.sources).forEach(function(domain) {
        let fb = config.sources[domain].f;
        if (fb && fb > "") {
          if (!fb.endsWith("/")) {
            fb += "/";
          }
          config.fb_pages[fb] = domain;
        }
        let tw = config.sources[domain].t;
        if (tw && tw > "") {
          const matches = /(https?:\/\/twitter.com\/[^\/]*)/.exec(tw);
          if (matches[1]) {
            const href = matches[1].toLowerCase();
            debug(href);
            config.tw_pages[href] = domain;
          }
        }
      });
      debug(config.tw_pages as any);
      setupGoogleAnalytics();
      setCollapsed(all);
      config.loaded = true;
      return config;
    } catch (err) {
      console.error(`ERROR Loading config: `, err);
    }
  }

  async load(force = false): Promise<IConfig> {
    if (!force && config.loaded) {
      log(`Returning loaded config`);
      return config;
    }
    if (force || !this.loadSettingsPromise) {
      this.loadSettingsPromise = this.get(force);
    }
    return await this.loadSettingsPromise;
  }
}

async function loadSettings(force = false) {
  return await LoadSettingsProcessor.getInstance().load(force);
}

async function loadCollapsedOnly() {
  const dict = await chromep.storage.sync.get();
  setCollapsed(dict);
}

async function resetIgnored() {
  log("Resetting ignored");
  report("reset", "shown");
  config.hiddenSites = {};
  await chromep.storage.local.set({ mbfchidden: config.hiddenSites });
  await chromep.storage.sync.set({ "ignored_sites.reset_ignored": false });
}

function report(eventAction, eventLabel = undefined, eventValue = undefined) {
  if (eventAction !== "set") log("REPORTING: ", eventAction, eventLabel, eventValue);
  if (gaAllowed) {
    if (devMode) {
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

const reportUnknown = (domain: string) => {
  if (!config.unknown[domain]) {
    config.unknown[domain] = true;
    report("site", "unknown", domain);
  }
};

const reportSite = (source: ISource, isAlias: boolean, isBase: boolean, isCollapsed: boolean, isOmnibar?: boolean) => {
  if (!source) return;
  if (ga) {
    ga("set", "isAlias", !!isAlias);
    ga("set", "isBase", !!isBase);
    ga("set", "collapsed", !!isCollapsed);
    ga("set", "omnibar", !!isOmnibar);
  }
  report("site", "shown", source.d);
  report("bias", "shown", source.b);
};

new GetConfigMessage((message: any) => {
  return loadSettings();
});

new ResetIgnoredMessage(async (message: any) => {
  await resetIgnored();
});

new ReloadConfigMessage(async (message: any) => {
  await loadSettings(true);
});

new ShowOptionsMessage((message: any) => {
  chrome.runtime.openOptionsPage();
});

new StartThanksMessage((message: any) => {
  report("thanks", "shown");
  // TODO
});

new ReportUnknownMessage((request: IReportUnknownRequest) => {
  reportUnknown(request.domain);
});

new AssociateSiteMessage((request: IAssociateSiteRequest) => {
  report("associatedSite", request.source, request.fb_url);
});

new ShowSiteMessage((request: IShowSiteRequest) => {
  reportSite(request.source, request.isAlias, request.isBase, request.isCollapsed);
});

new HideSiteMessage((request: IHideSiteRequest) => {
  config.hiddenSites[request.source.d] = !config.hiddenSites[request.source.d];
  const action = config.hiddenSites[request.source.d] ? "hide" : "show";
  report(action, "site", request.source);
  chromep.storage.local.set({ mbfchidden: config.hiddenSites }).then(function() {
    log("Resetting hidden to: ", config.hiddenSites);
  });
  return config.hiddenSites[request.source.d];
});

chrome.storage.onChanged.addListener(changes => {
  log("Storage Changed: ", changes);
  if (changes["ignored_sites.reset_ignored"] && changes["ignored_sites.reset_ignored"].newValue) {
    resetIgnored();
  }
  loadCollapsedOnly();
});

chrome.runtime.onInstalled.addListener(async () => {
  const firstrun = await getStorage("firstrun");
  if (firstrun != "done") {
    await chromep.storage.local.set({ firstrun: "done" });
    chrome.runtime.openOptionsPage();
  }
});

const tabListener = TabListener.getInstance(config);

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  tabListener.listen(tab);
});

chrome.tabs.onActivated.addListener(ids => {
  chrome.tabs.get(ids.tabId, tabListener.listen);
});

let lastTabId: number = null;
setInterval(async () => {
  const tab = await getCurrentTab();
  if (tab && tab.id !== lastTabId) {
    log(`Updating tab `, tab.title);
    lastTabId = tab.id;
    tabListener.listen(tab);
  }
}, 1000);

console.log(`Loading Settings`);
loadSettings();
