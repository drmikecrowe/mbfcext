export {};
const log = require("debug")("mbfc:utils:index");

import { browser } from "webextension-polyfill-ts";

export * from "webextension-polyfill-ts";
export * from "./checkDomain";
export * from "./constants";
export * from "./definitions";
export * from "./getCurrentTab";
export * from "./getDomain";
export * from "./google-analytics";
export * from "./messages";
export * from "./poller";
export * from "./storage";
export * from "./utils";

export const isDevMode = (): boolean => {
    const devMode =
        !browser.runtime || !("update_url" in browser.runtime.getManifest());
    if (devMode) {
        localStorage.debug = "mbfc:*";
    }
    return devMode;
};
