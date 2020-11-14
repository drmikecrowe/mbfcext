import chromep from "chrome-promise";
import { get } from "lodash";
import { GetConfigMessage, ShowSiteMessage, ReportUnknownMessage, StartThanksMessage, ResetIgnoredMessage, HideSiteMessage } from "../messages";

import debug from "debug";
import { isDevMode } from "../utils/utils";
import { IConfig, ISource } from "../utils/definitions";
isDevMode();
const log = debug("mbfc:filter");

export class Filter {
    config: IConfig;
    unknown: any = {};
    loaded = false;
    windowObjectReference = null;
    refreshInterval = null;

    constructor() {
        log(`Class Filter started`);
        this.updatedConfig();
        if (!this.refreshInterval) {
            this.refreshInterval = setInterval(() => this.updatedConfig, 60000);
        }
    }

    async updatedConfig() {
        const config: IConfig = await GetConfigMessage.SendMessage();
        this.config = config;
        this.loaded = true;
        this.process();
    }

    process() {
        throw new Error("Must be overloaded");
    }

    waitForElementToDisplay(selector, time, cb) {
        var el = document.querySelector(selector);
        if (el != null) {
            cb(el);
        } else {
            setTimeout(() => {
                this.waitForElementToDisplay(selector, time, cb);
            }, time);
        }
    }

    hideElement(el, count) {
        if (el && el.parentNode) {
            if (el.classList.value.indexOf("userContent") == -1) {
                el = el.parentNode;
            }
            var hide_class = "mbfcelh" + count;
            el.classList.add("mbfc-el-hidden");
            el.classList.add(hide_class);
            el.style.display = "none";
        }
    }

    thanksButton() {
        this.openRequestedPopup();
    }

    async ignoreButton(text, count) {
        var button = document.getElementById(`toolbar-button1-${count}`);
        const domain = button.attributes["data-domain"].value;
        const hide = button.attributes["data-collapse"].value !== "show";
        log(domain, button.attributes["data-collapse"].value, hide);
        log(`Ignoring ${text}/${domain}`);
        const source = this.config.sources[domain];
        this.config.hiddenSites[domain] = hide;
        HideSiteMessage.SendMessage(source, hide);
        if (hide) {
            var el = document.getElementById("mbfcext" + count);
            if (el) {
                el.style.display = "none";
            }
        } else {
            var el = document.getElementById("mbfcext" + count);
            if (el) {
                el.style.display = "inherit";
            }
        }
    }

    addButtons(text, count) {
        this.waitForElementToDisplay(".toolbar-button1-" + count, 500, button => {
            button.addEventListener("click", () => this.ignoreButton(text, count), false);
        });
        this.waitForElementToDisplay(".toolbar-button2-" + count, 500, button => {
            button.addEventListener("click", () => this.thanksButton(), false);
        });
        this.waitForElementToDisplay(".toolbar-button3-" + count, 500, button => {
            button.addEventListener("click", () => this.resetIgnored(), false);
        });
    }

    reportSite(site, isAlias: boolean, isBase: boolean, isCollapsed: boolean) {
        ShowSiteMessage.SendMessage(site, isAlias, isBase, isCollapsed);
    }

    reportUnknown(domain: string) {
        ReportUnknownMessage.SendMessage(domain);
    }

    openRequestedPopup() {
        StartThanksMessage.SendMessage();
        this.windowObjectReference = window.open("https://patreon.com/solvedbymike", "DescriptiveWindowName", "resizable,scrollbars,status");
    }

    resetIgnored() {
        ResetIgnoredMessage.SendMessage();
    }
}
