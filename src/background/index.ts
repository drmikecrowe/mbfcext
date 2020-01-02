import { Poller } from "./poller";

const log = require("debug")("ext:background");

async function polling() {
  // Use this function for periodic background polling
  log(`Polling`);
}

Poller.getInstance(polling);
