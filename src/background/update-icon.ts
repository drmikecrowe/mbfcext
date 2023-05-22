import { log } from "~background"
import { ConfigHandler, type ConfigStorage, getCurrentTab } from "~shared"

import { type SourceData, SourcesProcessor } from "./sources-processor"
import { TabListener } from "./tab-listenener"
import { getSiteFromUrl } from "./utils/get-site-from-url"

async function badgeUpdater(sourceData: SourceData, config: ConfigStorage): Promise<any> {
  const tl = TabListener.getInstance()
  const res = await getCurrentTab()
  const tab = res.isOk() ? res.value : null
  if (!tab) {
    log(`Unable to retrieve tab`)
    return
  }
  if (tab.url && tab.id && !tab.incognito) {
    const parsed_domain = getSiteFromUrl(tab.url, sourceData, config)
    if (parsed_domain.isErr()) {
      log(`Can't find domain for ${tab.url}`)
      await tl.resetIcon(tab.id, tab.windowId)
      return
    }
    const { site, collapse } = parsed_domain.value
    if (site) {
      const bias_items = sourceData.combined.biases.filter((b) => b.bias === site.bias)
      if (bias_items.length) {
        log(`Updating icon`)
        await tl.updateIcon(bias_items[0].bias, collapse, tab.id, tab.windowId)
      }
    }
  }
}
export function updateIcon() {
  log(`Tab changed, update icon`)
  badgeUpdater(SourcesProcessor.getInstance().sourceData, ConfigHandler.getInstance().config)
    .then(() => true)
    .catch((e) => console.error(e))
}
