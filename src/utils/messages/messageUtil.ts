import { logger } from "utils";
/**
 * License: zlib/libpng
 * @author Santo Pfingsten
 * @see https://github.com/Lusito/forget-me-not
 */
import { browser, Runtime } from "webextension-polyfill-ts";
import { get } from "lodash-es";
const log = logger("mbfc:messages");

// This file contains communication helpers

// fixme: types
export type Callback = (params: any, sender: Runtime.MessageSender) => any;
// export type Callback = (params: any, sender?: browser.runtime.MessageSender) => any;

type CallbacksMap = { [s: string]: Callback[] };

let callbacksMap: CallbacksMap | null = null;
let contentScriptTabs: number[] = [];

export interface ReceiverHandle {
    destroy(): void;
}

function getCallbacksList(name: string) {
    if (callbacksMap === null) {
        callbacksMap = {};
        browser.runtime.onMessage.addListener((request, sender) => {
            if (callbacksMap) {
                const callbacks = callbacksMap[request.action];
                if (callbacks) {
                    log(`Received message: `, request);
                    const tabId = get(sender, "tab.id");
                    if (tabId && contentScriptTabs.indexOf(tabId) === -1)
                        contentScriptTabs.push(tabId);
                    callbacks.forEach((cb) => cb(request.params, sender));
                }
            }
        });
    }
    const callbacks = callbacksMap[name];
    if (callbacks) return callbacks;
    return (callbacksMap[name] = []);
}

const noop = () => undefined;

export const messageUtil = {
    send(name: string, params?: any, callback?: (value: any) => any) {
        const data = {
            action: name,
            params,
        };
        const promise = browser.runtime.sendMessage(data);
        if (callback) promise.then(callback);
        promise.catch(noop);
        contentScriptTabs.forEach((tabId) => {
            const promise = browser.tabs.sendMessage(tabId, data);
            if (callback) promise.then(callback);
            promise.catch(noop);
        });
    },
    sendSelf(name: string, params: any) {
        if (callbacksMap) {
            const callbacks = callbacksMap[name];
            callbacks && callbacks.forEach((cb) => cb(params, {}));
        }
    },
    receive(name: string, callback: Callback): ReceiverHandle {
        const callbacks = getCallbacksList(name);
        callbacks.push(callback);
        return {
            destroy() {
                const index = callbacks.indexOf(callback);
                if (index !== -1) callbacks.splice(index, 1);
            },
        };
    },
    clearCallbacksMap() {
        callbacksMap = null;
    },
    setContentScriptTab(tab: any) {
        contentScriptTabs.push(tab);
    },
    clearContentScriptTabs() {
        contentScriptTabs = [];
    },
};
