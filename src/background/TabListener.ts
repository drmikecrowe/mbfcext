import { getCurrentTab, getSiteFromUrl } from "utils/tabUtils";
import browser, { Action, Tabs } from "webextension-polyfill";
import { logger } from "utils/logger";

const log = logger("mbfc:background:TabListener");

const colorMap = {
  L: { color: "white", backColor: "#0a44ff" },
  LC: { color: "black", backColor: "#94adff" },
  C: { color: "black", backColor: "white" },
  RC: { color: "black", backColor: "#ffb4b5" },
  R: { color: "white", backColor: "#ff171c" },
  PS: { color: "white", backColor: "green" },
  S: { color: "white", backColor: "green" },
  Q: { color: "black", backColor: "yellow" },
  CP: { color: "black", backColor: "yellow" },
  FN: { color: "black", backColor: "yellow" },
};

export class TabListener {
  private static instance: TabListener;
  private interval: Record<number, number> = {};
  private lastIcon = "";

  constructor() {
    log(`Initializing onUpdated for tab listener`);
    const badgeUpdater = () => this.updateBadge();
    browser.tabs.onHighlighted.addListener(badgeUpdater);
    browser.tabs.onActivated.addListener(badgeUpdater);
    browser.tabs.onUpdated.addListener(badgeUpdater);
    browser.windows.onFocusChanged.addListener(badgeUpdater);
  }

  static async getInstance() {
    if (!TabListener.instance) {
      TabListener.instance = new TabListener();
    }
    return TabListener.instance;
  }

  static draw(
    text: string,
    color,
    backColor
  ): Action.SetIconDetailsType | null {
    const canvas = document.createElement("canvas"); // Create the canvas
    canvas.width = 19;
    canvas.height = 19;
    let top = 2;
    let left = 10;
    let font = 17;

    const context = canvas.getContext("2d");
    if (!context) return null;
    if (backColor === "white") {
      context.fillStyle = color;
      context.fillRect(0, 0, 19, 19);
      context.fillStyle = backColor;
      context.fillRect(1, 1, 17, 17);
      left -= 1;
    } else {
      context.fillStyle = backColor;
      context.fillRect(0, 0, 19, 19);
    }
    if (text.length > 1) {
      font = 14;
      top = 4;
    }

    context.fillStyle = color;
    context.textAlign = "center";
    context.textBaseline = "top";
    context.font = `${font}px sans-serif`;
    context.fillText(text, left, top);
    return {
      imageData: {
        "19": context.getImageData(0, 0, 19, 19) as any,
      },
    };
  }

  static show(icon: string, inverse: boolean, tabId: number) {
    const color = inverse ? colorMap[icon].backColor : colorMap[icon].color;
    const backColor = !inverse
      ? colorMap[icon].backColor
      : colorMap[icon].color;
    // log(`Showing icon ${icon}`);
    const imageData = TabListener.draw(icon, color, backColor);
    if (imageData) {
      browser.browserAction.setIcon({
        tabId,
        ...imageData,
      });
    }
  }

  showTab(icon: string, collapse: boolean, tabId: number) {
    this.reset(tabId);
    TabListener.show(icon, false, tabId);
    this.lastIcon = icon;
    if (collapse) {
      let inverse = false;
      this.interval[tabId] = setInterval(() => {
        inverse = !inverse;
        TabListener.show(icon, inverse, tabId);
      }, 1000) as any;
    }
  }

  reset(tabId: number): boolean {
    this.lastIcon = "";
    if (this.interval[tabId]) {
      clearInterval(this.interval[tabId]);
      delete this.interval[tabId];
    }
    return false;
  }

  updateTab(tab: Tabs.Tab): boolean {
    if (!tab || !tab.url || !tab.id) return false;
    const parsed_domain = getSiteFromUrl(tab.url);
    if (parsed_domain.isErr()) return this.reset(tab.id);
    const { site, collapse } = parsed_domain.value;
    if (site && site.b) {
      const icon = site.b;
      if (icon !== this.lastIcon) {
        if (!colorMap[site.b]) {
          log(`No colorMap for icon ${site.b} from `, site);
          return this.reset(tab.id);
        }
        this.showTab(icon, collapse, tab.id);
        log(`Icon: ${icon} ${collapse ? " flashing" : ""}`, parsed_domain);
      }
      return true;
    }
    return this.reset(tab.id);
  }

  public static resetIcon(tabId: number) {
    browser.browserAction.setIcon({
      tabId,
      path: "icons/icon48.png",
    });
  }

  public async updateBadge() {
    const res = await getCurrentTab();
    const tab = res.isOk() ? res.value : null;
    if (tab && tab.url && tab.id && !tab.incognito) {
      if (!this.updateTab(tab)) {
        TabListener.resetIcon(tab.id);
      }
    } else {
      // TabListener.resetIcon(tab.id);
      console.log(`ERROR: No tab, should I reset it completely??`);
    }
  }
}
