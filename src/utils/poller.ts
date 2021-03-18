import { StorageHandler } from "utils/StorageHandler";
import { Alarms, browser } from "webextension-polyfill-ts";

import { ConfigHandler } from "utils/ConfigHandler";
import { logger } from "utils/logger";

const log = logger("mbfc:utils:poller");

type PollFunction = () => void;

export class Poller {
  private static instance: Poller;
  private pollFunction: PollFunction | undefined;
  private storage: StorageHandler;

  constructor() {
    this.storage = StorageHandler.getInstance();
  }

  static getInstance(pollFn?: PollFunction) {
    if (!Poller.instance) {
      Poller.instance = new Poller();
      log("Poller initialized");
      Poller.instance.pollFunction = pollFn;

      browser.runtime.onInstalled.addListener(() =>
        Poller.instance.runtimeOnInstalled()
      );
      browser.runtime.onStartup.addListener(() =>
        Poller.instance.runtimeOnStartup()
      );
      browser.alarms.onAlarm.addListener((alarm) =>
        Poller.instance.alarmsOnAlarm(alarm)
      );
      browser.runtime.onMessage.addListener((request, sender) =>
        Poller.instance.runtimeOnMessage(request, sender)
      );

      // (async () => {
      //     const alarms = await browser.alarms.getAll();
      //     for (const alarm of alarms) {
      //         log(
      //             `${alarm.name} is present with period of ${alarm.periodInMinutes} minutes and fire at`,
      //             DateFilter(alarm.scheduledTime)
      //         );
      //     }
      // })().catch((err) => {
      //     console.error(err);
      // });
    }
    return Poller.instance;
  }

  async runtimeOnInstalled() {
    await StorageHandler.getInstance().getConfig();
    log("onInstalled....");
    this.scheduleRequest();
    this.scheduleWatchdog();
  }

  async alarmsOnAlarm(alarm: Alarms.Alarm) {
    // if watchdog is triggered, check whether refresh alarm is there
    if (alarm && alarm.name === "watchdog") {
      const alm = await browser.alarms.get("refresh");
      if (alm) {
        log("Refresh alarm exists.");
      } else {
        // if it is not there, start a new request and reschedule refresh alarm
        log("Refresh alarm doesn't exist, starting a new one");
        this.startRequest();
        this.scheduleRequest();
      }
    } else {
      // if refresh alarm triggered, start a new request
      this.startRequest();
    }
  }

  async runtimeOnStartup() {
    log("onStartup....");
    this.startRequest();
  }

  runtimeOnMessage(request: any, sender: any): Promise<any> | void {
    if (request.type === "refresh") {
      log(`Manual Refresh fired.`);
      return this.startRequest();
    }
    return Promise.resolve();
  }

  // schedule a new fetch every 30 minutes
  async scheduleRequest() {
    const cfg = ConfigHandler.getInstance().config;
    if (cfg.isErr()) return;
    const config = cfg.value;
    log(`schedule refresh alarm to ${config.pollMinutes} minutes...`);
    browser.alarms.create("refresh", {
      periodInMinutes: config.pollMinutes,
    });
  }

  // schedule a watchdog check every 5 minutes
  async scheduleWatchdog() {
    log(`schedule watchdog alarm to 5 minutes...`);
    browser.alarms.create("watchdog", { periodInMinutes: 5 });
  }

  // fetch data and save to local storage
  async startRequest() {
    const cfg = ConfigHandler.getInstance().config;
    if (cfg.isErr()) return;
    const config = cfg.value;

    if (typeof this.pollFunction === "function") {
      log("polling extensions...");
      await this.pollFunction();
    }
    config.lastRun = Date.now();
    await this.storage.update(config);
  }
}
