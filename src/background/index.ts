import {
    GoogleAnalytics,
    isDevMode,
    logger,
    Poller,
    StorageHandler,
} from "utils";
import { MessageProcessor } from "./MessageProcessor";
import { SourcesProcessor } from "./SourcesProcessor";
import { TabListener } from "./TabListener";
import { SourcesHandler } from "utils/SourcesHandler";
import { ConfigHandler } from "utils/ConfigHandler";
import { UpdatedConfigMessage } from "utils/messages/UpdatedConfigMessage";
const log = logger("mbfc:background:index");

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
    SourcesHandler.getInstance();
    ConfigHandler.getInstance();
    await StorageHandler.getInstance().getConfig();
    MessageProcessor.getInstance();
    TabListener.getInstance();
    Poller.getInstance(polling);
    GoogleAnalytics.getInstance();
    await UpdatedConfigMessage.update();
    await SourcesProcessor.getInstance().getSources();
    // TODO: Here we need to watch storage and send the message when options change
})().catch((err) => {
    console.error(err);
});
