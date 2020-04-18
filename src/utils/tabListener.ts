export {};
const log = require("debug")("mbfc:utils:tabListener");

import { words, capitalize } from "lodash";
import { getDomain } from "./getDomain";
import { checkDomain } from "./checkDomain";
import { ISource, IBias, IReporting } from "./definitions";
import { getConfig } from "@/background/config";
import { SourcesProcessor } from "@/background/sources";
import { browser } from "webextension-polyfill-ts";

interface IDetails {
  site: ISource | null;
  bias: IBias | null;
  reporting: IReporting | null;
}

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
};

const firstLetter = (text) => {
  if (text === "conspiracy") text = "conspiracy-pseudoscience";
  if (text === "fake-news") text = "Questionable";
  return words(text)
    .map((word) => capitalize(word.substring(0, 1)))
    .join("")
    .substring(0, 4);
};

const draw = (text, color, backColor) => {
  var canvas = document.createElement("canvas"); // Create the canvas
  canvas.width = 19;
  canvas.height = 19;
  let left = 10;
  let top = 12;

  var context = canvas.getContext("2d");
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

  context.fillStyle = color;
  context.textAlign = "center";
  context.textBaseline = "top";
  context.font = "bold 14 px serif";
  context.fillText(text, left, 5);
  return context.getImageData(0, 0, 19, 19);
};

export class TabListener {
  private static instance: TabListener;
  private interval: number | undefined;
  private inverse = false;
  private collapse = false;
  private icon: string | undefined;
  private site;
  private lastTab;

  static getInstance() {
    if (!TabListener.instance) {
      TabListener.instance = new TabListener();
    }
    return TabListener.instance;
  }

  async details(tab): Promise<IDetails> {
    const none = { site: null, bias: null, reporting: null };
    const [config, sources] = await Promise.all([getConfig(), SourcesProcessor.getInstance().getConfig()]);
    const { domain, path } = getDomain(tab.url);
    if (domain) {
      let icon = null;
      if (domain.indexOf("facebook.com") > -1) {
        log(`Not setting icon for facebook`);
      } else {
        const parsed_domain = checkDomain(domain, path, config, sources);
        log(parsed_domain);
        const { site, collapse } = parsed_domain;
        if (site) {
          const { b, r } = site;
          this.site = site;
          this.collapse = collapse;
          const bias = b ? sources.biases[b] : null;
          const reporting = r ? sources.reporting[r] : null;
          return { site, bias, reporting };
        }
      }
    }
    return none;
  }

  show = () => {
    if (!this.icon) return;
    const color = this.inverse ? colorMap[this.icon].backColor : colorMap[this.icon].color;
    const backColor = !this.inverse ? colorMap[this.icon].backColor : colorMap[this.icon].color;
    log(`Showing icon ${this.icon}`);
    browser.browserAction.setIcon({
      imageData: draw(this.icon, color, backColor),
    });
    if (this.collapse) {
      this.inverse = !this.inverse;
    }
  };

  listen = (tab) => {
    const self = this;
    if (!tab) return;
    if (!tab.url.startsWith("http")) {
      log(`Not listening for tab ${tab.url}`);
      return;
    }
    log(`Listener activated for tab: `, tab.url, tab.active);
    if (tab.url !== undefined && tab.active) {
      (async () => {
        const { site } = await this.details(tab);
        let icon;
        if (this.interval) clearInterval(this.interval);
        this.interval = undefined;
        if (site) {
          icon = firstLetter(site.b);
          if (icon && !colorMap[icon]) {
            log(`No colorMap for icon ${icon} from `, site);
            icon = undefined;
          }
        }
        if (icon) {
          this.lastTab = tab.id;
          log(`Icon: ${icon}`);
          this.icon = icon;
          this.site = site;
          this.inverse = false;
          this.show();
          if (this.collapse && !this.interval) {
            this.interval = setInterval(this.show, 1000) as any;
          }
        } else {
          log(`Showing blank icon`);
          browser.browserAction.setIcon({ path: "icons/icon48.png" });
        }
      })().catch((err) => {
        console.error(err);
      });
    }
  };
}
