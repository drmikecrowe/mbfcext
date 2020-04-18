export {}
const log = require('debug')('mbfc:utils:utils');

export function isDevMode(): boolean {
    let devMode = !chrome.runtime || !("update_url" in chrome.runtime.getManifest());
    if (devMode) {
        localStorage.debug = "mbfc:*";
    }
    return devMode;
}

export function toM(num) {
    if (num > 1000000) {
        return `${Math.round(num / 1000000)}M`;
    }
    if (num > 1000) {
        return `${Math.round(num / 1000)}K`;
    }
    return num;
}
