/**
 * Icons tab content - displays bias icon samples
 * Creates DOM elements directly without innerHTML to avoid UNSAFE_VAR_ASSIGNMENT warnings
 */

import { BiasEnums } from "~models"

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

function createIconDataUrl(text: string, color: string, backColor: string): string | null {
  const canvas = document.createElement("canvas")
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

  return canvas.toDataURL()
}

function createIconRow(key: string, value: { text: string; color: string; backColor: string }): HTMLDivElement {
  const div = document.createElement("div")
  const innerDiv = document.createElement("div")

  // Text description
  innerDiv.appendChild(document.createTextNode(`Icon: text=${value.text}, color=${value.color} backColor=${value.backColor}`))

  // Line break
  innerDiv.appendChild(document.createElement("br"))

  // First icon image
  const dataUrl1 = createIconDataUrl(value.text, value.color, value.backColor)
  if (dataUrl1) {
    const img1 = document.createElement("img")
    img1.src = dataUrl1
    innerDiv.appendChild(img1)
  }

  // Spacing
  innerDiv.appendChild(document.createTextNode("\u00A0\u00A0"))

  // Second icon image (inverted colors)
  const dataUrl2 = createIconDataUrl(value.text, value.backColor, value.color)
  if (dataUrl2) {
    const img2 = document.createElement("img")
    img2.src = dataUrl2
    innerDiv.appendChild(img2)
  }

  // Spacing
  innerDiv.appendChild(document.createTextNode("\u00A0\u00A0"))

  div.appendChild(innerDiv)
  return div
}

export function renderIcons(containerId: string): void {
  const container = document.getElementById(containerId)
  if (!container) return

  // Clear container without innerHTML
  while (container.firstChild) {
    container.removeChild(container.firstChild)
  }

  Object.entries(colorMap).forEach(([key, value]) => {
    container.appendChild(createIconRow(key, value))
  })
}
