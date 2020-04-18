export {};
const log = require("debug")("mbfc:background:sources");

import { fetch as fetchPolyfill } from "whatwg-fetch";
import { ISources } from "@/utils/definitions";
import { COMBINED } from "@/utils";

export class SourcesProcessor {
  retrievingPromise: Promise<ISources> | undefined;
  sources: ISources = {
    sources: {},
    biases: {},
    fb_pages: {},
    tw_pages: {},
    loaded: false,
  };
  private static instance: SourcesProcessor;

  static getInstance() {
    if (!SourcesProcessor.instance) {
      SourcesProcessor.instance = new SourcesProcessor();
    }
    return SourcesProcessor.instance;
  }

  async getConfig(): Promise<ISources> {
    if (this.sources.loaded) return this.sources;
    if (!this.retrievingPromise) this.retrievingPromise = this.retrieveRemote();
    return this.retrievingPromise;
  }

  isConfigLoaded(): boolean {
    return this.sources.loaded;
  }

  async retrieveRemote(): Promise<ISources> {
    const self = this;
    try {
      const res = await fetchPolyfill(COMBINED);
      let combined = await res.json();
      log("Combined: ", combined);
      if (!combined) return self.sources;
      log("Settings retrieved, processing");
      Object.keys(combined).forEach((key) => {
        log(`Retrieved ${key}: `, combined[key]);
        //Object.assign(self.sources[key], combined[key])
      });
      if (!self.sources.biases["left-center"]) {
        self.sources.biases["left-center"] = self.sources.biases["leftcenter"];
      }
      log("Extracting facebook and twitter domains");
      Object.keys(self.sources).forEach((domain) => {
        let fb = self.sources[domain].f;
        if (fb && fb > "") {
          if (!fb.endsWith("/")) {
            fb += "/";
          }
          self.sources.fb_pages[fb] = domain;
        }
        let tw = self.sources[domain].t;
        if (tw && tw > "") {
          const matches = /(https?:\/\/twitter.com\/[^\/]*)/.exec(tw);
          if (matches && matches[1]) {
            const href = matches[1].toLowerCase();
            log("HREF: ", href);
            self.sources.tw_pages[href] = domain;
          }
        }
      });
      log(self.sources.tw_pages as any);
      self.sources.loaded = true;
    } catch (err) {
      console.error(`ERROR Loading sources: `, err);
    }
    return self.sources;
  }
}
