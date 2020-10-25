import { Result, err } from "neverthrow";
import { browser, checkDomain, getDomain, CheckDomainResults } from "utils";
import { Tabs } from "webextension-polyfill-ts";

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
        const { domain, path } = getDomain(url);
        if (domain) {
            if (domain.indexOf("facebook.com") === -1) {
                return checkDomain(domain, path);
            }
        }
    } catch (err) {
        // ignore
    }
    return err(null);
};
