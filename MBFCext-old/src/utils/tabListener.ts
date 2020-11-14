import { words, capitalize } from "lodash";
import debug from "debug";
import { isDevMode } from "./utils";
import { getDomain } from "./getDomain";
import { checkDomain } from "./checkDomain";
import { IConfig, ISource, IBias, IReporting } from "./definitions";

const devMode = isDevMode();
const log = debug("mbfc:tab-listener");

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

const firstLetter = text => {
  if (text === "conspiracy") text = "conspiracy-pseudoscience";
  if (text === "fake-news") text = "Questionable";
  return words(text)
    .map(word => capitalize(word.substring(0, 1)))
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
  private config: IConfig;
  private interval = null;
  private inverse = false;
  private collapse = false;
  private icon;
  private site;
  private lastTab: number = null;

  static getInstance(config?: IConfig) {
    if (!TabListener.instance) {
      if (!config) throw new Error("No config passed to TabListener");
      TabListener.instance = new TabListener();
      TabListener.instance.config = config;
    }
    return TabListener.instance;
  }

  details = (tab): { site: ISource; bias: IBias; reporting: IReporting } => {
    const { domain, path } = getDomain(tab.url);
    if (domain) {
      let icon = null;
      if (domain.indexOf("facebook.com") > -1) {
        log(`Not setting icon for facebook`);
      } else {
        const parsed_domain = checkDomain(domain, path, this.config);
        log(parsed_domain);
        const { site, collapse } = parsed_domain;
        this.site = site;
        this.collapse = collapse;
        const bias = site ? this.config.biases[site.b] : null;
        const reporting = site ? this.config.reporting[site.r] : null;
        return { site, bias, reporting };
      }
    }
    return { site: null, bias: null, reporting: null };
  };

  show = () => {
    const color = this.inverse ? colorMap[this.icon].backColor : colorMap[this.icon].color;
    const backColor = !this.inverse ? colorMap[this.icon].backColor : colorMap[this.icon].color;
    chrome.browserAction.setIcon({
      imageData: draw(this.icon, color, backColor),
    });
    if (this.collapse) {
      this.inverse = !this.inverse;
    }
  };

  listen = tab => {
    if (!tab) return;
    log(tab.url, tab.active);
    if (tab.url !== undefined && tab.active) {
      const { site } = this.details(tab);
      let icon;
      if (this.interval) clearInterval(this.interval);
      this.interval = null;
      if (site) {
        icon = firstLetter(site.b);
        if (icon && !colorMap[icon]) {
          log(`No colorMap for icon ${icon} from `, site);
          icon = null;
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
          this.interval = setInterval(this.show, 1000);
        }
      } else {
        chrome.browserAction.setIcon({ path: "icons/icon48.png" });
      }
    }
  };
}
