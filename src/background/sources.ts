import debug from "debug";
const log = debug("mbfc:background:sources");

import { fetch as fetchPolyfill } from "whatwg-fetch";
import { ISources } from "utils/definitions";
import { COMBINED } from "utils";
import { keys } from "lodash";

export class SourcesProcessor {
    retrievingPromise: Promise<ISources> | undefined;
    sources: ISources = {
        sources: {},
        aliases: {},
        reporting: {},
        biases: {},
        fb_pages: {},
        tw_pages: {},
        loaded: false,
    };
    private static instance: SourcesProcessor;

    static getInstance(): SourcesProcessor {
        if (!SourcesProcessor.instance) {
            SourcesProcessor.instance = new SourcesProcessor();
            log("SourcesProcessor initialized");
        }
        return SourcesProcessor.instance;
    }

    async getSources(): Promise<ISources> {
        if (this.areSourcesLoaded()) return this.sources;
        if (!this.retrievingPromise)
            this.retrievingPromise = this.retrieveRemote();
        return this.retrievingPromise;
    }

    areSourcesLoaded(): boolean {
        return this.sources.loaded;
    }

    async retrieveRemote(): Promise<ISources> {
        const self = this;
        try {
            const res = await fetchPolyfill(COMBINED);
            const combined = await res.json();
            log("Combined: ", combined);
            if (!combined) return self.sources;
            log("Settings retrieved, processing");
            Object.keys(combined).forEach((key) => {
                log(
                    `Retrieved ${key} with ${
                        keys(combined[key]).length
                    } entries`
                );
                Object.assign(self.sources[key], combined[key]);
            });
            if (!self.sources.biases["left-center"]) {
                self.sources.biases["left-center"] =
                    self.sources.biases["leftcenter"];
            }
            log("Extracting facebook and twitter domains");
            Object.keys(self.sources.sources).forEach((domain) => {
                let fb = self.sources.sources[domain].f;
                if (fb && fb > "") {
                    if (fb.indexOf("?") > -1) fb = fb.split("?")[0];
                    if (!fb.endsWith("/")) {
                        fb += "/";
                    }
                    self.sources.fb_pages[fb] = domain;
                }
                const tw = self.sources.sources[domain].t;
                if (tw && tw > "") {
                    const matches = /(https?:\/\/twitter.com\/[^\/]*)/.exec(tw);
                    if (matches && matches[1]) {
                        const href = matches[1].toLowerCase();
                        log("HREF: ", href);
                        self.sources.tw_pages[href] = domain;
                    } else {
                        self.sources.tw_pages[
                            `https://twitter.com/${tw}`
                        ] = domain;
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
