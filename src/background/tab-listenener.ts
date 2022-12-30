import iconSrc from "../../assets/icon.png"
import { BiasEnums, getTabById, logger } from "../utils"

const log = logger("mbfc:background:TabListener")

const colorMap: Record<BiasEnums, { color: string; backColor: string; text: string }> = {
  [BiasEnums.Left]: { text: "L", color: "white", backColor: "#0a44ff" },
  [BiasEnums.LeftCenter]: { text: "LC", color: "black", backColor: "#94adff" },
  [BiasEnums.Center]: { text: "C", color: "black", backColor: "white" },
  [BiasEnums.RightCenter]: { text: "RC", color: "black", backColor: "#ffb4b5" },
  [BiasEnums.Right]: { text: "R", color: "white", backColor: "#ff171c" },
  [BiasEnums.ProScience]: { text: "PS", color: "white", backColor: "green" },
  [BiasEnums.Satire]: { text: "S", color: "white", backColor: "green" },
  [BiasEnums.ConspiracyPseudoscience]: { text: "CP", color: "black", backColor: "yellow" },
  [BiasEnums.FakeNews]: { text: "FN", color: "black", backColor: "yellow" },
}

export class TabListener {
  private static instance: TabListener
  private imageCache: Record<string, any> = {}
  interval: Record<number, number> = {}
  lastBias: string = ""

  static getInstance(): TabListener {
    if (!TabListener.instance) {
      TabListener.instance = new TabListener()
    }
    return TabListener.instance
  }

  private draw(text: string, color: string, backColor: string): any | null {
    const key = `${text}-${color}-${backColor}`
    if (!(key in this.imageCache)) {
      log(`Generating ${key} and caching`)
      const canvas = document.createElement("canvas") // Create the canvas
      canvas.width = 19
      canvas.height = 19
      let top = 2
      let left = 10
      let font = 17

      const context = canvas.getContext("2d")
      if (!context) return null
      if (backColor === "white") {
        context.fillStyle = color
        context.fillRect(0, 0, 19, 19)
        context.fillStyle = backColor
        context.fillRect(1, 1, 17, 17)
        left -= 1
      } else {
        context.fillStyle = backColor
        context.fillRect(0, 0, 19, 19)
      }
      if (text.length > 1) {
        font = 14
        top = 4
      }

      context.fillStyle = color
      context.textAlign = "center"
      context.textBaseline = "top"
      context.font = `${font}px sans-serif`
      context.fillText(text, left, top)
      this.imageCache[key] = {
        imageData: {
          "19": context.getImageData(0, 0, 19, 19) as any,
        },
      }
    }
    return this.imageCache[key]
  }

  private show(bias: BiasEnums, inverse: boolean, tabId: number) {
    const { color, backColor, text } = colorMap[bias]
    const c = inverse ? backColor : color
    const bc = !inverse ? backColor : color
    const imageData = this.draw(text, c, bc)
    if (imageData) {
      chrome.action.setIcon({
        tabId,
        ...imageData,
      })
    }
  }

  resetIcon(tabId: number) {
    if (this.interval[tabId]) {
      clearInterval(this.interval[tabId])
      delete this.interval[tabId]
    }
    this.lastBias = ""
    try {
      chrome.action.setIcon({
        tabId,
        path: iconSrc,
      })
    } catch (e) {
      console.error(e)
    }
    return false
  }

  updateIcon(bias: BiasEnums, collapse: boolean, tabId: number) {
    try {
      if (bias === this.lastBias) return
      if (!(bias in BiasEnums)) {
        log(`Bias ${bias} invalid.  Ignoring`)
        return this.resetIcon(tabId)
      }
      this.resetIcon(tabId)
      this.show(bias, false, tabId)
      this.lastBias = bias
      log(`Icon: ${bias} ${collapse ? " flashing" : ""}`)

      if (collapse) {
        let inverse = false
        this.interval[tabId] = setInterval(() => {
          getTabById(tabId).then((res) => {
            if (res.isOk()) {
              inverse = !inverse
              this.show(bias, inverse, tabId)
            } else {
              this.resetIcon(tabId)
            }
          })
        }, 1000) as any
      }
    } catch (e) {
      debugger
    }
  }
}
