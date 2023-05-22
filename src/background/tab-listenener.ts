import { BiasEnums } from "~models"
import { getTabById, logger } from "~shared"

import center_invert from "./icons/center-invert.png"
import center from "./icons/center.png"
import conspiracy_pseudoscience_invert from "./icons/conspiracy-pseudoscience-invert.png"
import conspiracy_pseudoscience from "./icons/conspiracy-pseudoscience.png"
import fake_news_invert from "./icons/fake-news-invert.png"
import fake_news from "./icons/fake-news.png"
import icon from "./icons/icon.png"
import left_center_invert from "./icons/left-center-invert.png"
import left_center from "./icons/left-center.png"
import left_invert from "./icons/left-invert.png"
import left from "./icons/left.png"
import pro_science_invert from "./icons/pro-science-invert.png"
import pro_science from "./icons/pro-science.png"
import right_center_invert from "./icons/right-center-invert.png"
import right_center from "./icons/right-center.png"
import right_invert from "./icons/right-invert.png"
import right from "./icons/right.png"
import satire_invert from "./icons/satire-invert.png"
import satire from "./icons/satire.png"

const log = logger("mbfc:background:TabListener")

interface ColorMap {
  color: string
  backColor: string
  text: string
  normal: any
  invert: any
}

export const colorMap: Record<BiasEnums, ColorMap> = {
  [BiasEnums.Left]: { text: "L", color: "white", backColor: "#0a44ff", normal: left, invert: left_invert },
  [BiasEnums.LeftCenter]: { text: "LC", color: "black", backColor: "#94adff", normal: left_center, invert: left_center_invert },
  [BiasEnums.Center]: { text: "C", color: "black", backColor: "white", normal: center, invert: center_invert },
  [BiasEnums.RightCenter]: { text: "RC", color: "black", backColor: "#ffb4b5", normal: right_center, invert: right_center_invert },
  [BiasEnums.Right]: { text: "R", color: "white", backColor: "#ff171c", normal: right, invert: right_invert },
  [BiasEnums.ProScience]: { text: "PS", color: "white", backColor: "green", normal: pro_science, invert: pro_science_invert },
  [BiasEnums.Satire]: { text: "S", color: "white", backColor: "green", normal: satire, invert: satire_invert },
  [BiasEnums.ConspiracyPseudoscience]: { text: "CP", color: "black", backColor: "yellow", normal: conspiracy_pseudoscience, invert: conspiracy_pseudoscience_invert },
  [BiasEnums.FakeNews]: { text: "FN", color: "black", backColor: "yellow", normal: fake_news, invert: fake_news_invert },
}

export class TabListener {
  private static instance: TabListener

  interval: Record<number, number> = {}
  inverse: Record<number, boolean> = {}

  static getInstance(): TabListener {
    if (!TabListener.instance) {
      TabListener.instance = new TabListener()
    }
    return TabListener.instance
  }

  private async show(bias: BiasEnums, inverse: boolean, tabId: number) {
    const { normal, invert } = colorMap[bias]
    const image = inverse ? invert : normal
    try {
      await chrome.action.setIcon({
        tabId,
        path: image,
      })
    } catch (e) {
      console.error(e)
    }
  }

  async resetIcon(tabId: number, windowId: number) {
    log(`Resetting icon`)
    if (this.interval[windowId]) {
      clearInterval(this.interval[windowId])
      delete this.interval[windowId]
      delete this.inverse[windowId]
    }
    try {
      await chrome.action.setIcon({
        tabId,
        path: icon,
      })
    } catch (e) {
      console.error(e)
    }
    return false
  }

  async blinkIcon(tabId: number, windowId, bias: BiasEnums) {
    const res = await getTabById(tabId)
    if (res.isErr()) {
      log(`Tab ${tabId} not found.  Resetting icon`)
      return this.resetIcon(tabId, windowId)
    }
    this.inverse[windowId] = !this.inverse[windowId]
    return this.show(bias, this.inverse[windowId], tabId)
  }

  async updateIcon(bias: BiasEnums, collapse: boolean, tabId: number, windowId: number) {
    try {
      if (!(bias in colorMap)) {
        log(`Bias ${bias} invalid.  Ignoring`)
        return
      }
      await this.resetIcon(tabId, windowId)
      log(`Updating icon for tab ${tabId} to ${bias}`)
      await this.show(bias, false, tabId)

      if (collapse) {
        if (this.interval[windowId]) return
        this.inverse[windowId] = false
        this.interval[windowId] = setInterval(async () => {
          await this.blinkIcon(tabId, windowId, bias)
        }, 1000) as any
        log(`Starting to blink icon for tab ${tabId}`)
      }
    } catch (e) {
      console.error(e)
    }
  }
}
