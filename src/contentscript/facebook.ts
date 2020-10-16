const log = require("debug")("mbfc:contentscript:facebook");

import { browser } from "webextension-polyfill-ts";
import { GetConfigMessage } from "utils/messages";
import { isDevMode } from "utils";

log(`Loaded into facebook page`);

(async () => {
    function messageReceived(message) {
        log(message);
    }

    // browser.runtime.onMessage.addListener(messageReceived);
    // const myPort = browser.runtime.connect(browser.runtime.id);
    // myPort.onMessage.addListener(async (response: any) => {
    //     log("OnMessage: ", response);
    // });
    const cfg = await new GetConfigMessage().sendMessage();
    log(`Got config: `, cfg);
})().catch((err) => {
    console.error(err);
    if (isDevMode()) debugger;
});
