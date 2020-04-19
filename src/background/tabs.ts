const log = require("debug")("mbfc:background:tabs");
import { TabListener } from "./tabListener";
import { getCurrentTab } from "@/utils/getCurrentTab";
import { browser } from "webextension-polyfill-ts";

export class TabProcessor {
  private static instance: TabProcessor;
  private constructor() {
    // do something construct...
  }
  static getInstance() {
    if (!TabProcessor.instance) {
      TabProcessor.instance = new TabProcessor();
      const tabListener = TabListener.getInstance();

      log(`Initializing onUpdated for tab listener`);
      browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
        tabListener.listen(tab);
      });

      log(`Initializing onActivated for tab listener`);
      browser.tabs.onActivated.addListener(async (ids) => {
        log(`Activating tab listener for tab ${ids.tabId}`);
        let tab = await browser.tabs.get(ids.tabId);
        tabListener.listen(tab);
      });

      let lastTabId: number | undefined = undefined;
      setInterval(async () => {
        const tab = await getCurrentTab();
        if (tab && tab.id !== lastTabId) {
          log(`Updating tab `, tab.title);
          lastTabId = tab.id;
          tabListener.listen(tab);
        }
      }, 1000);
    }
    return TabProcessor.instance;
  }
}
