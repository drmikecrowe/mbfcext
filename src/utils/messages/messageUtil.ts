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

export const messageUtil = {
    send(name: string, params?: any): Promise<any> {
        const data = {
            action: name,
            params,
        };
        const promises: Promise<any>[] = [];
        const elog = (e: Error) => {
            log(`Error sending ${name}`, e);
        };
        const handle = (promise: Promise<any>) => {
            promises.push(promise.then(cb).catch(elog));
        };
        const cb = () => {
            log(`Sending ${name} complete`);
        };
        handle(browser.runtime.sendMessage(data));
        contentScriptTabs.forEach((tabId) => {
            handle(browser.tabs.sendMessage(tabId, data));
        });
        return Promise.all(promises).then(cb).catch(elog);
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
