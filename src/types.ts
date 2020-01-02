// @ts-nocheck

declare const browser: typeof chrome;

const apis = [
  "alarms",
  "bookmarks",
  "browserAction",
  "commands",
  "contextMenus",
  "cookies",
  "downloads",
  // 'events',
  "extension",
  "extensionTypes",
  "history",
  "i18n",
  "idle",
  "notifications",
  "pageAction",
  "runtime",
  "storage",
  "tabs",
  "webNavigation",
  "webRequest",
  "windows"
] as Array<keyof Extension>;

export class Extension {
  alarms: typeof chrome.alarms;
  bookmarks: typeof chrome.bookmarks;
  browserAction: typeof chrome.browserAction;
  commands: typeof chrome.commands;
  contextMenus: typeof chrome.contextMenus;
  cookies: typeof chrome.cookies;
  downloads: typeof chrome.downloads;
  // events: typeof chrome.events
  extension: typeof chrome.extension;
  // extensionTypes: typeof chrome.extensionTypes
  history: typeof chrome.history;
  i18n: typeof chrome.i18n;
  idle: typeof chrome.idle;
  nortifications: typeof chrome.notifications;
  pageAction: typeof chrome.pageAction;
  runtime: typeof chrome.runtime;
  storage: typeof chrome.storage;
  tabs: typeof chrome.tabs;
  webNavigation: typeof chrome.webNavigation;
  webRequest: typeof chrome.webRequest;
  windows: typeof chrome.windows;

  constructor() {
    apis.forEach((api: keyof Extension) => {
      // tslint:disable:strict-type-predicates
      if (typeof chrome !== "undefined") {
        this[api] = chrome[api];
      }
      // tslint:disable:strict-type-predicates
      if (typeof window !== "undefined" && window[api]) {
        this[api] = window[api];
      }
      // tslint:disable:strict-type-predicates
      if (typeof browser !== "undefined") {
        if (browser.extension && browser.extension[api]) {
          this[api] = browser.extension[api];
        } else if (browser[api]) {
          this[api] = browser[api];
        }
      }
    });

    // tslint:disable:strict-type-predicates
    if (typeof browser !== "undefined") {
      if (browser.runtime) {
        this.runtime = browser.runtime;
      }
      if (browser.browserAction) {
        this.browserAction = browser.browserAction;
      }
    }
  }
}
