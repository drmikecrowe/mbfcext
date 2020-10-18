import { browser } from "webextension-polyfill-ts";
export * from "webextension-polyfill-ts";

export const devMode =
    !browser.runtime || !("update_url" in browser.runtime.getManifest());

if (devMode) {
    localStorage.debug = "mbfc:*";
}
export const log = require("debug")("mbfc");
log.enabled = devMode;
log("Loaded");

export const isDevMode = (): boolean => {
    return devMode;
};

export const logger = (namespace: string) => {
    const l = log.extend(namespace.replace(/^mbfc:/, ""));
    l.enabled = devMode;
    return l;
};

export * from "./checkDomain";
export * from "./constants";
export * from "./definitions";
export * from "./getDomain";
export * from "./google-analytics";
export * from "./messages";
export * from "./poller";
export * from "./StorageHandler";
export * from "./utils";
export * from "./SourcesHandler";
export * from "./ConfigHandler";
export * from "./filters";
