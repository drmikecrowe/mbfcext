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

export const MBFC = "mbfc";
export const C_URL = "https://mediabiasfactcheck.com/";
export const C_FOUND = `${MBFC}-found`;
export const C_NOT = `:not(.${C_FOUND})`;
export const C_REPORT_DIV = `${MBFC}-report-div`;

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
            this.process([]);
        });
        messageUtil.receive(UpdatedSourcesMessage.method, () => {
            this.sources = SourcesHandler.getInstance().sources;
            this.loaded = this.config.isOk() && this.sources.isOk();
            this.process([]);
        });
        log(`MutationObserver started`);

        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                const parents: Element[] = [];

                const handleNodes = (newNodes: NodeList) => {
                    if (newNodes !== null) {
                        newNodes.forEach((n) => {
                            const p = n.parentElement;
                            if (!p) return;
                            if (p.id.startsWith("mount")) return;
                            if (p.tagName === "DIV") {
                                if (parents.filter((pe) => pe !== p))
                                    parents.push(p);
                            }
                        });
                    }
                };

                handleNodes(mutation.addedNodes);
                this.cleanMbfcNodes(mutation.removedNodes);
                handleNodes(mutation.removedNodes);
                if (parents.length) this.process(parents);
            });
        });

        observer.observe(document, {
            childList: true,
            subtree: true,
            attributes: false,
            characterData: false,
        });
    }

    cleanMbfcNodes(qn: NodeList | Element[]) {
        qn.forEach((qne) => {
            const e: Element = qne as Element;
            if (!e.querySelectorAll) return;
            if (!e.querySelector(`.${MBFC}`)) return;
            if (e.tagName === "MBFC") {
                if (e.parentElement) this.cleanMbfcNodes([e.parentElement]);
                e.remove();
            } else {
                e.querySelectorAll(MBFC).forEach((mbfc) => {
                    mbfc.remove();
                });
                e.querySelectorAll(`.${MBFC}`).forEach((p) => {
                    p.classList.forEach((cls) => {
                        if (cls.startsWith(MBFC)) p.classList.remove(cls);
                    });
                });
            }
        });
    }

    addClasses(e: Element, cls: string[]) {
        cls.forEach((c) => {
            if (!e.classList.contains(c)) e.classList.add(c);
        });
        if (!e.classList.contains(MBFC)) e.classList.add(MBFC);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    process(_parents: Element[]) {
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
        if (el) {
            const hide_class = `${MBFC}elh` + count;
            this.addClasses(el, [hide_class]);
            el.style.display = "none";
        }
    }

    showElement(el) {
        if (el) {
            el.style.display = "inherit";
        }
    }

    thanksButton() {
        this.openRequestedPopup();
    }

    ignoreButton(text, count) {
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
        const domain_class = `${MBFC}-${domain.replace(".", "-")}`;
        document.querySelectorAll(`.${domain_class}`).forEach((e) => {
            if (hide) this.hideElement(e, count);
            else this.showElement(e);
        });
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
