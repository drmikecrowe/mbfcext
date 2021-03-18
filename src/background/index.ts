import { SourcesHandler } from "utils/SourcesHandler";
import { ConfigHandler } from "utils/ConfigHandler";
import { UpdatedConfigMessage } from "utils/messages/UpdatedConfigMessage";
import { MessageProcessor } from "./MessageProcessor";
import { SourcesProcessor } from "./SourcesProcessor";
import { TabListener } from "./TabListener";
import { GoogleAnalytics } from "../utils/google-analytics";
import { logger, isDevMode } from "../utils/logger";
import { Poller } from "../utils/poller";
import { StorageHandler } from "../utils/StorageHandler";

const log = logger("mbfc:background:index");

async function polling() {
  // Use this function for periodic background polling
  const i = SourcesProcessor.getInstance();
  if (i.areSourcesLoaded()) {
    log(`Polling`);
    i.retrieveRemote();
  }
}

const main = async () => {
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
};

// while (true) {
main()
  .then(() => log("Main exited!"))
  .catch((e) => console.error(e));
// }
