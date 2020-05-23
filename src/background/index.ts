export {};
const log = require("debug")("mbfc:background:index");

import { SourcesProcessor } from "./sources";
import { isDevMode, GoogleAnalytics, storage, Poller } from "utils";
import { MessageProcessor } from "./messages";
import { TabProcessor } from "./tabs";

async function polling() {
    // Use this function for periodic background polling
    const i = SourcesProcessor.getInstance();
    if (i.areSourcesLoaded()) {
        log(`Polling`);
        i.retrieveRemote();
    }
}

(async () => {
    isDevMode();
    await SourcesProcessor.getInstance().getSources();
    Poller.getInstance(polling);
    GoogleAnalytics.getInstance();
    TabProcessor.getInstance();
    MessageProcessor.getInstance();

    // TODO: Here we need to watch storage and send the message when options change
})().catch((err) => {
    console.error(err);
});
