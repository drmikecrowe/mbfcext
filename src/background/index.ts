export {};
const log = require("debug")("mbfc:background:index");

import { Poller } from "@/utils/poller";
import { SourcesProcessor } from "./sources";
import { OptionsProcessor } from "./options";
import { isDevMode } from "@/utils";
// import { GoogleAnalytics } from "@/utils/google-analytics";
// import { MessageProcessor } from "./messages";
// import { TabProcessor } from "./tabs";

async function polling() {
  // Use this function for periodic background polling
  const i = SourcesProcessor.getInstance();
  if (i.isConfigLoaded()) {
    log(`Polling`);
    i.retrieveRemote();
  }
}

(async () => {
  isDevMode();
  await Promise.all([SourcesProcessor.getInstance().getConfig(), OptionsProcessor.getInstance().getOptions()]);
  Poller.getInstance(polling);
  // GoogleAnalytics.getInstance();
  // TabProcessor.getInstance();
  // MessageProcessor.getInstance();
})().catch((err) => {
  console.error(err);
});
