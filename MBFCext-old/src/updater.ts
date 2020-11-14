import debug from "debug";
import { isDevMode } from "./utils";

const devMode = isDevMode();
const log = debug("mbfc:updater");

class Updater {
    private static instance: Updater;
    private constructor() {
        // do something construct...
    }
    static getInstance() {
        if (!Updater.instance) {
            Updater.instance = new Updater();

            const timer: any = {};
            if (devMode) {
                log(`Setting refresh timer to 10m`);
                timer.periodInMinutes = 10;
            } else {
                log(`Setting refresh timer to 12h`);
                timer.periodInMinutes = 12 * 60; // Refresh every 12h
            }

            window["browser"].alarms.create("updater", timer);

            window["browser"].alarms.onAlarm.addListener(function(alarm) {
                if (alarm.name === "updater") {
                    Updater.instance.update();
                }
            });

            window["browser"].storage.local.get(["biases", "sources"], function(items) {
                if (items.sources === undefined || items.biases === undefined) {
                    Updater.instance.update();
                }
            });
        }
        return Updater.instance;
    }

    update() {
        log("Forcing refresh from server");
        chrome.runtime.sendMessage({ method: "updateAll" });
    };
}

Updater.getInstance();