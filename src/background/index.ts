export {}
const log = require('debug')('mbfc:background:index');
// const log = require("debug")("mbfc:background:index");

// import { Poller } from "@/utils/poller";
// import { SourcesProcessor } from "./sources";
// async function polling() {
//   // Use this function for periodic background polling
//   const i = SourcesProcessor.getInstance();
//   if (i.isConfigLoaded()) {
//     log(`Polling`);
//     i.retrieveRemote();
//   }
// }
// Poller.getInstance(polling);

// import { GoogleAnalytics } from "@/utils/google-analytics";
// GoogleAnalytics.getInstance();

// import { TabProcessor } from "./tabs";
// TabProcessor.getInstance();

// import { MessageProcessor } from "./messages";
// MessageProcessor.getInstance();

// import { OptionsProcessor } from "./options";
// (async () => {
//   await Promise.all([SourcesProcessor.getInstance().getConfig(), OptionsProcessor.getInstance().getOptions()]);
// })().catch((err) => {
// console.error(err);
// });
