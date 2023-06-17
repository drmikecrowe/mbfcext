import React from "react"

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

function icon(text: string, color: string, backColor: string) {
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
  // return context.getImageData(0, 0, 19, 19)
  return canvas.toDataURL()
}

const Icon = (props) => {
  const { text, color, backColor } = props
  return (
    <div>
      Icon: text={text}, color={color} backColor={backColor}
      <br />
      <img src={icon(text, color, backColor)} /> &nbsp;&nbsp;
      <img src={icon(text, backColor, color)} /> &nbsp;&nbsp;
    </div>
  )
}

export default function Icons({ id, activeTab }: { id: string; activeTab: string }) {
  const active = activeTab === id
  return (
    <div
      style={{
        visibility: active ? "visible" : "hidden",
        display: active ? "block" : "none",
      }}
      id={id}>
      {Object.entries(colorMap).map(([key, value]) => (
        <Icon key={key} text={value.text} color={value.color} backColor={value.backColor} />
      ))}
    </div>
  )
}
