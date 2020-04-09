import { Alarms } from "webextension-polyfill-ts";
import debug from "debug";
import { getStorage, getPollMinutes, isDevMode, setStorage } from "@/utils";
import { Extension } from "@/types";
import date from "@/utils/filters/date";

const OPTIONS_FIRST_RUN = true;

isDevMode();

const log = debug("ext:poller");

export class Poller {
  private static instance: Poller;
  private pollFunction: Function | undefined;
  private ext: Extension = new Extension();

  private constructor() {}

  static getInstance(pollFn?: Function) {
    if (!Poller.instance) {
      Poller.instance = new Poller();
      Poller.instance.pollFunction = pollFn;
      const ext = Poller.instance.ext;

      ext.runtime.onInstalled.addListener(() => Poller.instance.runtimeOnInstalled());
      ext.runtime.onStartup.addListener(() => Poller.instance.runtimeOnStartup());
      ext.alarms.onAlarm.addListener(alarm => Poller.instance.alarmsOnAlarm(alarm));
      ext.runtime.onMessage.addListener((request, sender) =>
        Poller.instance.runtimeOnMessage(request, sender)
      );

      ext.alarms.getAll(alarms => {
        for (let alarm of alarms) {
          console.log(
            `${alarm.name} is present with period of ${alarm.periodInMinutes} minutes and fire at`,
            date(alarm.scheduledTime)
          );
        }
      });
    }
    return Poller.instance;
  }

  async runtimeOnInstalled() {
    console.log("onInstalled....");
    this.scheduleRequest();
    this.scheduleWatchdog();
    const firstrun = await getStorage("firstrun");
    log(`Installed.  firstrun=${firstrun}`);
    if (firstrun != "done") {
      await setStorage("firstrun", "done");
      if (OPTIONS_FIRST_RUN) this.ext.runtime.openOptionsPage();
    }
  }

  async alarmsOnAlarm(alarm: Alarms.Alarm) {
    // if watchdog is triggered, check whether refresh alarm is there
    if (alarm && alarm.name === "watchdog") {
      const alarm = await new Promise(resolve =>
        this.ext.alarms.get("refresh", results => resolve(results))
      );
      if (alarm) {
        console.log("Refresh alarm exists.");
      } else {
        // if it is not there, start a new request and reschedule refresh alarm
        console.log("Refresh alarm doesn't exist, starting a new one");
        this.startRequest();
        this.scheduleRequest();
      }
    } else {
      // if refresh alarm triggered, start a new request
      this.startRequest();
    }
  }

  async runtimeOnStartup() {
    console.log("onStartup....");
    this.startRequest();
  }

  runtimeOnMessage(request: any, sender: any): Promise<any> | void {
    debug(sender.tab ? "from a content script:" + sender.tab.url : "from the extension");
    if (request.type == "refresh") {
      log(`Manual Refresh fired.`);
      return this.startRequest();
    }
  }

  // schedule a new fetch every 30 minutes
  async scheduleRequest() {
    const minutes = await getPollMinutes();
    console.log(`schedule refresh alarm to ${minutes} minutes...`);
    await setStorage("alarmMinutes", `${minutes}`);
    this.ext.alarms.create("refresh", { periodInMinutes: minutes });
  }

  // schedule a watchdog check every 5 minutes
  async scheduleWatchdog() {
    console.log(`schedule watchdog alarm to 5 minutes...`);
    this.ext.alarms.create("watchdog", { periodInMinutes: 5 });
  }

  // fetch data and save to local storage
  async startRequest() {
    if (typeof this.pollFunction === "function") {
      console.log("polling extensions...");
      await this.pollFunction();
    }
    await setStorage("lastRun", Date.now());
  }
}
