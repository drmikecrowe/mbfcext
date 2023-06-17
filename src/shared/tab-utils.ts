import { Result, err, ok } from "neverthrow"
import browser from "webextension-polyfill"

import { isDevMode } from "./logger"

export async function getTabById(tabId: number): Promise<Result<browser.Tabs.Tab, null>> {
  try {
    const tabInfo = await browser.tabs.get(tabId)
    return ok(tabInfo)
  } catch (error) {
    console.error(error)
  }
  return err(null)
}

export async function getCurrentTab(): Promise<Result<browser.Tabs.Tab, null>> {
  return new Promise((resolve) => {
    ;(async () => {
      const queryInfo: any = {
        active: true,
        currentWindow: true,
      }

      const [tabs, wind] = await Promise.all([browser.tabs.query(queryInfo), browser.windows.getLastFocused()])
      let t: browser.Tabs.Tab | undefined
      tabs.forEach((tab) => {
        if (tab.windowId === wind.id) t = tab
      })
      if (t) return resolve(ok(t))
      if (isDevMode() && tabs.length) return resolve(ok(tabs[0]))
      resolve(err(null))
    })().catch((e) => {
      console.error(e)
    })
  })
}
