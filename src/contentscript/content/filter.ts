import debug from "debug";
import { Result } from "neverthrow";
import {
    HideSiteMessage,
    IConfig,
    isDevMode,
    ISources,
    ReportUnknownMessage,
    ResetIgnoredMessage,
    ShowSiteMessage,
    StartThanksMessage,
    UpdatedSourcesMessage,
} from "utils";
import { ConfigHandler } from "utils/ConfigHandler";
import { ISource } from "utils/definitions";
import { messageUtil } from "utils/messages/messageUtil";
import { UpdatedConfigMessage } from "utils/messages/UpdatedConfigMessage";
import { SourcesHandler } from "utils/SourcesHandler";

isDevMode();
const log = debug("mbfc:filter");

export class Filter {
    config: Result<IConfig, null>;
    sources: Result<ISources, null>;
    unknown: any = {};
    loaded = false;
    windowObjectReference: Window | null = null;

    constructor() {
        log(`Class Filter started`);
        this.config = ConfigHandler.getInstance().config;
        this.sources = SourcesHandler.getInstance().sources;
        messageUtil.receive(UpdatedConfigMessage.method, () => {
            this.config = ConfigHandler.getInstance().config;
            this.loaded = this.config.isOk() && this.sources.isOk();
            this.process();
        });
        messageUtil.receive(UpdatedSourcesMessage.method, () => {
            this.sources = SourcesHandler.getInstance().sources;
            this.loaded = this.config.isOk() && this.sources.isOk();
            this.process();
        });
        log(`MutationObserver started`);
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                const newNodes = mutation.addedNodes;
                if (newNodes !== null) {
                    this.process();
                }
            });
        });

        observer.observe(document, {
            childList: true,
            subtree: true,
            attributes: false,
            characterData: false,
        });
    }

    process() {
        throw new Error("Must be overloaded");
    }

    waitForElementToDisplay(selector, time, cb) {
        const el = document.querySelector(selector);
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
            const hide_class = "mbfcelh" + count;
            el.classList.add("mbfc-el-hidden");
            el.classList.add(hide_class);
            el.style.display = "none";
        }
    }

    thanksButton() {
        this.openRequestedPopup();
    }

    async ignoreButton(text, count) {
        if (this.config.isErr()) return;
        const button = document.getElementById(`toolbar-button1-${count}`);
        if (!button) return;
        const domain = button.attributes["data-domain"].value;
        const hide = button.attributes["data-collapse"].value !== "show";
        log(domain, button.attributes["data-collapse"].value, hide);
        log(`Ignoring ${text}/${domain}`);
        new HideSiteMessage(domain).sendMessage();
        const el = document.getElementById("mbfcext" + count);
        if (el) {
            el.style.display = hide ? "none" : "inherit";
        }
    }

    reportSite(
        site: ISource,
        isAlias: boolean,
        isBase: boolean,
        isCollapsed: boolean
    ) {
        new ShowSiteMessage(site, isAlias, isBase, isCollapsed).sendMessage();
    }

    reportUnknown(domain: string) {
        new ReportUnknownMessage(domain).sendMessage();
    }

    resetIgnored() {
        new ResetIgnoredMessage().sendMessage();
    }

    openRequestedPopup() {
        new StartThanksMessage().sendMessage();
        this.windowObjectReference = window.open(
            "https://patreon.com/solvedbymike",
            "DescriptiveWindowName",
            "resizable,scrollbars,status"
        );
    }

    addButtons(text, count) {
        this.waitForElementToDisplay(
            ".toolbar-button1-" + count,
            500,
            (button) => {
                button.addEventListener(
                    "click",
                    () => this.ignoreButton(text, count),
                    false
                );
            }
        );
        this.waitForElementToDisplay(
            ".toolbar-button2-" + count,
            500,
            (button) => {
                button.addEventListener(
                    "click",
                    () => this.thanksButton(),
                    false
                );
            }
        );
        this.waitForElementToDisplay(
            ".toolbar-button3-" + count,
            500,
            (button) => {
                button.addEventListener(
                    "click",
                    () => this.resetIgnored(),
                    false
                );
            }
        );
    }
}
