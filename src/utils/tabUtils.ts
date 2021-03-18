import { err, ok, Result } from "neverthrow";
import { SourcesHandler } from "utils/SourcesHandler";
import { browser, Tabs } from "webextension-polyfill-ts";

import { checkDomain, CheckDomainResults } from "utils/checkDomain";
import { getDomain } from "utils/getDomain";
import { isDevMode } from "utils/logger";

export async function getCurrentTab(): Promise<Result<Tabs.Tab, null>> {
  return new Promise((resolve) => {
    (async () => {
      const queryInfo = {
        active: true,
        currentWindow: true,
      };

      const [tabs, wind] = await Promise.all([
        browser.tabs.query(queryInfo),
        browser.windows.getLastFocused(),
      ]);
      let t: Tabs.Tab | undefined;
      tabs.forEach((tab) => {
        if (tab.windowId === wind.id) t = tab;
      });
      if (t) return resolve(ok(t));
      if (isDevMode() && tabs.length) return resolve(ok(tabs[0]));
      resolve(err(null));
    })().catch((e) => {
      console.error(e);
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
            return getSiteFromUrl(`https://${ndomain}`.toLowerCase());
          }
        } else if (domain.indexOf("twitter.com") > -1) {
          if (sources.tw_pages[path]) {
            const ndomain = sources.tw_pages[path];
            return getSiteFromUrl(`https://${ndomain}`.toLowerCase());
          }
        } else {
          return checkDomain(domain, path);
        }
      }
    }
  } catch (e) {
    // ignore
  }
  return err(null);
};
