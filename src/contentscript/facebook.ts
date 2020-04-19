const log = require("debug")("mbfc:contentscript:facebook");

import { browser } from "webextension-polyfill-ts";
import { ShowSiteMessage } from "@/utils/messages";

log(`Loaded into facebook page`);

var myPort = browser.runtime.connect(browser.runtime.id);
myPort.postMessage(
  new ShowSiteMessage(
    {
      b: "S",
      d: "yahoo.com",
      f: "yahoo",
      t: "yahoo",
      n: "The Onion",
      P: 99,
      u: "the-onion",
      h: "",
      L: 1,
      M: 1,
      r: "M",
      p: "",
    },
    false,
    false,
    false,
  ),
);
