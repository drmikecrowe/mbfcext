import zip from "lodash/zip";
import { browser, checkDomain, getDomain, logger } from "utils";
import { getCurrentTab, getSiteFromUrl } from "utils/tabUtils";

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
  private interval: number | undefined;
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

  static draw(text: string, color, backColor) {
    const canvas = document.createElement("canvas"); // Create the canvas
    canvas.width = 19;
    canvas.height = 19;
    let top = 2;
    let left = 10;
    let font = 17;

    const context = canvas.getContext("2d");
    if (!context) return;
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
    return context.getImageData(0, 0, 19, 19);
  }

  static show(icon: string, inverse: boolean) {
    const color = inverse ? colorMap[icon].backColor : colorMap[icon].color;
    const backColor = !inverse
      ? colorMap[icon].backColor
      : colorMap[icon].color;
    // log(`Showing icon ${icon}`);
    browser.browserAction.setIcon({
      imageData: TabListener.draw(icon, color, backColor),
    });
  }

  showTab(icon: string, collapse: boolean) {
    this.reset();
    TabListener.show(icon, false);
    this.lastIcon = icon;
    if (collapse) {
      let inverse = false;
      this.interval = setInterval(() => {
        inverse = !inverse;
        TabListener.show(icon, inverse);
      }, 1000) as any;
    }
  }

  reset(): boolean {
    this.lastIcon = "";
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = 0;
    }
    return false;
  }

  updateTab(tab: any): boolean {
    const parsed_domain = getSiteFromUrl(tab.url);
    if (parsed_domain.isErr()) return this.reset();
    const { site, collapse } = parsed_domain.value;
    if (site && site.b) {
      const icon = site.b;
      if (icon !== this.lastIcon) {
        if (!colorMap[site.b]) {
          log(`No colorMap for icon ${site.b} from `, site);
          return this.reset();
        }
        this.showTab(icon, collapse);
        log(`Icon: ${icon} ${collapse ? " flashing" : ""}`, parsed_domain);
      }
      return true;
    }
    return this.reset();
  }

  public static resetIcon() {
    browser.browserAction.setIcon({
      path: "icons/icon48.png",
    });
  }

  public async updateBadge() {
    const res = await getCurrentTab();
    const tab = res.isOk() ? res.value : null;
    if (tab && tab.url && !tab.incognito) {
      if (!this.updateTab(tab)) {
        TabListener.resetIcon();
      }
    } else {
      TabListener.resetIcon();
    }
  }
}
