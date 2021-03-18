import { getDomain } from "utils/getDomain";
import { ICombined, ISources } from "utils/definitions";
import { keys, has } from "lodash";
import { version } from "assets/latest.json";
import { logger } from "utils/logger";

const log = logger("mbfc:background:sources");

export class BaseSourcesProcessor {
  sources: ISources = {
    version: 0,
    date: "",
    sources: {},
    aliases: {},
    reporting: {},
    biases: {},
    traffic: {} as any,
    credibility: {} as any,
    subdomains: {},
    fb_pages: {},
    tw_pages: {},
    loaded: false,
  };

  public areSourcesLoaded(): boolean {
    return this.sources.version >= version && this.sources.loaded;
  }

  public setSource(key: string, val: any) {
    log(`Retrieved ${key} with ${keys(val).length} entries`);
    Object.assign(this.sources[key], val);
  }

  public updateFacebook(d: string) {
    let fb: string | undefined = this.sources.sources[d].f;
    if (fb && fb > "") {
      if (fb.indexOf("?") > -1) fb = fb.split("?").pop();
      if (fb && fb > "") {
        const { path } = getDomain(`https://facebook.com/${fb.toLowerCase()}`);
        this.sources.fb_pages[path] = d;
      }
    }
  }

  public updateTwitter = (d: string) => {
    let tw = this.sources.sources[d].t;
    if (tw && tw > "") {
      const matches = /(https?:\/\/twitter.com\/[^/]*)/.exec(tw);
      if (matches && matches[1]) {
        tw = matches[1];
      }
      if (tw && tw > "") {
        const { path } = getDomain(`https://twitter.com/${tw.toLowerCase()}`);
        this.sources.tw_pages[path] = d;
      }
    }
  };

  public updateSubdomain = (d: string) => {
    if (d.indexOf("/") > -1) {
      const { domain, path } = getDomain(`https://${d}`);
      if (!has(this.sources.subdomains, domain)) {
        this.sources.subdomains[domain] = {};
      }
      this.sources.subdomains[domain][path] = this.sources.sources[d];
    }
  };

  public initializeCombined = (combined: ICombined) => {
    log("Settings retrieved, processing");
    Object.keys(combined).forEach((key) => this.setSource(key, combined[key]));
    log("Extracting facebook and twitter domains");
    Object.keys(this.sources.sources).forEach((domain) => {
      this.updateFacebook(domain);
      this.updateTwitter(domain);
      this.updateSubdomain(domain);
    });
    Object.entries(this.sources.sources).forEach(([domain, source]) => {
      if (has(this.sources.subdomains, domain)) {
        this.sources.subdomains[domain]["/"] = source;
      }
    });
    this.sources.loaded = true;
  };
}
