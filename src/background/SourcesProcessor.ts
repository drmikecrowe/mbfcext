import { keys } from "lodash";
import { COMBINED, ISources, logger, UpdatedSourcesMessage } from "utils";
import { fetch as fetchPolyfill } from "whatwg-fetch";
const log = logger("mbfc:background:sources");

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

    setSource(key: string, val: any) {
        log(`Retrieved ${key} with ${keys(val).length} entries`);
        Object.assign(this.sources[key], val);
    }

    updateDomain(domain: string) {
        let fb = this.sources.sources[domain].f;
        if (fb && fb > "") {
            if (fb.indexOf("?") > -1) fb = fb.split("?")[0];
            if (!fb.endsWith("/")) {
                fb += "/";
            }
            this.sources.fb_pages[fb] = domain;
        }
        const tw = this.sources.sources[domain].t;
        if (tw && tw > "") {
            const matches = /(https?:\/\/twitter.com\/[^/]*)/.exec(tw);
            if (matches && matches[1]) {
                const href = matches[1].toLowerCase();
                log("HREF: ", href);
                this.sources.tw_pages[href] = domain;
            } else {
                this.sources.tw_pages[`https://twitter.com/${tw}`] = domain;
            }
        }
    }

    async retrieveRemote(): Promise<ISources> {
        try {
            const res = await fetchPolyfill(COMBINED);
            const combined = await res.json();
            log("Combined: ", combined);
            if (!combined) return this.sources;
            log("Settings retrieved, processing");
            Object.keys(combined).forEach((key) =>
                this.setSource(key, combined[key])
            );
            if (!this.sources.biases["left-center"]) {
                this.sources.biases["left-center"] = this.sources.biases[
                    "leftcenter"
                ];
            }
            log("Extracting facebook and twitter domains");
            Object.keys(this.sources.sources).forEach((domain) =>
                this.updateDomain(domain)
            );
            log(this.sources.tw_pages as any);
            this.sources.loaded = true;
            const msg = new UpdatedSourcesMessage(this.sources);
            await msg.sendMessage(true);
        } catch (err) {
            console.error(`ERROR Loading sources: `, err);
        }
        return this.sources;
    }
}
