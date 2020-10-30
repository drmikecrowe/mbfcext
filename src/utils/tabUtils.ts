import { Result, err } from "neverthrow";
import { browser, checkDomain, getDomain, CheckDomainResults } from "utils";
import { Tabs } from "webextension-polyfill-ts";
import { SourcesHandler } from "utils/SourcesHandler";

export async function getCurrentTab(): Promise<Tabs.Tab> {
    return new Promise((resolve) => {
        (async () => {
            const queryInfo = {
                active: true,
                currentWindow: true,
            };

            const tabs = await browser.tabs.query(queryInfo);
            resolve(tabs[0]);
        })().catch((err) => {
            console.error(err);
        });
    });
}

export const getSiteFromUrl = (
    url: string
): Result<CheckDomainResults, null> => {
    try {
        const sh = SourcesHandler.getInstance();
        if (sh.sources.isOk()) {
            const sources = sh.sources.value;
            const { domain, path } = getDomain(url);
            if (domain) {
                if (domain.indexOf("facebook.com") > -1) {
                    if (sources.fb_pages[path]) {
                        const ndomain = sources.fb_pages[path];
                        const url = `https://${ndomain}`.toLowerCase();
                        return getSiteFromUrl(url);
                    }
                } else if (domain.indexOf("twitter.com") > -1) {
                    if (sources.tw_pages[path]) {
                        const ndomain = sources.tw_pages[path];
                        const url = `https://${ndomain}`.toLowerCase();
                        return getSiteFromUrl(url);
                    }
                } else {
                    return checkDomain(domain, path);
                }
            }
        }
    } catch (err) {
        // ignore
    }
    return err(null);
};
