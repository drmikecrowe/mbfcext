import type { PlasmoContentScript } from "plasmo"

export const config: PlasmoContentScript = {
  matches: ["https://facebook.com/*", "https://www.facebook.com/*"],
}

window.addEventListener("load", () => {
  console.log("content script loaded")

  document.body.style.background = "pink"
})
