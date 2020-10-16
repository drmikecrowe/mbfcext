export {}
const log = require('debug')('mbfc:utils:poller');

import { Alarms } from "webextension-polyfill-ts";
import { storage } from "utils";
import { browser } from "webextension-polyfill-ts";
import date from "utils/filters/date";

const OPTIONS_FIRST_RUN = true;

export class Poller {
    private static instance: Poller;
    private pollFunction: Function | undefined;

    private constructor() {}

    static getInstance(pollFn?: Function) {
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

            (async () => {
                const alarms = await browser.alarms.getAll();
                for (const alarm of alarms) {
                    log(
                        `${alarm.name} is present with period of ${alarm.periodInMinutes} minutes and fire at`,
                        date(alarm.scheduledTime)
                    );
                }
            })().catch((err) => {
                console.error(err);
            });
        }
        return Poller.instance;
    }

    async runtimeOnInstalled() {
        log("onInstalled....");
        this.scheduleRequest();
        this.scheduleWatchdog();
        const firstrun = await storage.firstrun.get();
        log(`Installed.  firstrun=${firstrun}`);
        if (firstrun) {
            await storage.firstrun.set(false);
            if (OPTIONS_FIRST_RUN) browser.runtime.openOptionsPage();
        }
    }

    async alarmsOnAlarm(alarm: Alarms.Alarm) {
        // if watchdog is triggered, check whether refresh alarm is there
        if (alarm && alarm.name === "watchdog") {
            const alarm = await browser.alarms.get("refresh");
            if (alarm) {
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
        if (request.type == "refresh") {
            log(`Manual Refresh fired.`);
            return this.startRequest();
        }
    }

    // schedule a new fetch every 30 minutes
    async scheduleRequest() {
        const minutes = await storage.pollMinutes.get();
        log(`schedule refresh alarm to ${minutes} minutes...`);
        browser.alarms.create("refresh", { periodInMinutes: minutes });
    }

    // schedule a watchdog check every 5 minutes
    async scheduleWatchdog() {
        log(`schedule watchdog alarm to 5 minutes...`);
        browser.alarms.create("watchdog", { periodInMinutes: 5 });
    }

    // fetch data and save to local storage
    async startRequest() {
        if (typeof this.pollFunction === "function") {
            log("polling extensions...");
            await this.pollFunction();
        }
        await storage.lastRun.set(Date.now());
    }
}
