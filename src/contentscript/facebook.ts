import { browser } from "webextension-polyfill-ts";
import { GetConfigMessage } from "utils/messages";
import { isDevMode } from "utils";

isDevMode();
const log = require("debug")("mbfc:contentscript:facebook");

log(`Loaded into facebook page`);

(async () => {
    const myPort = browser.runtime.connect(browser.runtime.id);
    myPort.onMessage.addListener((response: any, port: any) => {
        log("response: ", response);
    });
    await myPort.postMessage(new GetConfigMessage());
})().catch((err) => {
    //next(err)
});
