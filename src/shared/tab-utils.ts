import { Result, err, ok } from "neverthrow"

import { isDevMode } from "./logger"

export async function getTabById(tabId: number): Promise<Result<chrome.tabs.Tab, null>> {
  try {
    const tabInfo = await chrome.tabs.get(tabId)
    return ok(tabInfo)
  } catch (error) {
    console.error(error)
  }
  return err(null)
}

export async function getCurrentTab(): Promise<Result<chrome.tabs.Tab, null>> {
  return new Promise((resolve) => {
    ;(async () => {
      const queryInfo: any = {
        active: true,
        currentWindow: true,
      }

      const [tabs, wind] = await Promise.all([chrome.tabs.query(queryInfo), chrome.windows.getLastFocused()])
      let t: chrome.tabs.Tab | undefined
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

