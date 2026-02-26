/**
 * mbfc-overlay.ts
 *
 * Content script that runs on all pages. On desktop, the popup handles
 * bias display. On Android Firefox, browser_action popups are not supported,
 * so the background sends a "show-overlay" message to this script instead,
 * which injects a floating overlay directly into the page.
 */

import type { PlasmoCSConfig } from "plasmo"
import browser from "webextension-polyfill"

import type { PopupDetails } from "~popup"

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"],
  run_at: "document_idle",
}

const OVERLAY_ID = "mbfc-android-overlay"

// Bias category → accent color
const BIAS_COLORS: Record<string, string> = {
  "left bias": "#2563eb",
  "left-center bias": "#60a5fa",
  "least biased": "#16a34a",
  "right-center bias": "#f97316",
  "right bias": "#dc2626",
  "extreme right": "#7f1d1d",
  "extreme left": "#1e3a8a",
  "conspiracy-pseudoscience": "#7c3aed",
  "questionable sources": "#7c3aed",
  satire: "#d97706",
  "pro-science": "#0891b2",
  "fake news": "#991b1b",
}

function getAccentColor(bias: string): string {
  const key = bias.toLowerCase()
  for (const [k, v] of Object.entries(BIAS_COLORS)) {
    if (key.includes(k)) return v
  }
  return "#475569"
}

function removeOverlay() {
  document.getElementById(OVERLAY_ID)?.remove()
}

function showOverlay(details: PopupDetails) {
  removeOverlay()

  const accent = getAccentColor(details.bias)

  const overlay = document.createElement("div")
  overlay.id = OVERLAY_ID
  overlay.setAttribute("role", "dialog")
  overlay.setAttribute("aria-label", "Media Bias / Fact Check rating")

  // All styles inlined to avoid any page CSS interference
  overlay.style.cssText = `
    position: fixed;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 2147483647;
    width: min(92vw, 420px);
    background: #0f172a;
    border: 1px solid ${accent};
    border-radius: 12px;
    box-shadow: 0 0 0 1px rgba(255,255,255,0.05), 0 20px 60px rgba(0,0,0,0.6);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 14px;
    line-height: 1.5;
    color: #e2e8f0;
    overflow: hidden;
    animation: mbfc-slide-up 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  `

  const style = document.createElement("style")
  style.textContent = `
    @keyframes mbfc-slide-up {
      from { opacity: 0; transform: translateX(-50%) translateY(16px); }
      to   { opacity: 1; transform: translateX(-50%) translateY(0); }
    }
    #${OVERLAY_ID} a { color: #93c5fd; text-decoration: none; }
    #${OVERLAY_ID} a:hover { text-decoration: underline; }
    #mbfc-close-btn:active { background: rgba(255,255,255,0.15) !important; }
  `
  document.head.appendChild(style)

  // Accent bar
  const bar = document.createElement("div")
  bar.style.cssText = `height: 3px; background: ${accent}; width: 100%;`

  // Header
  const header = document.createElement("div")
  header.style.cssText = `
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 14px 8px;
    border-bottom: 1px solid rgba(255,255,255,0.07);
  `

  const headerLeft = document.createElement("div")
  headerLeft.style.cssText = `display: flex; align-items: center; gap: 8px;`

  const dot = document.createElement("div")
  dot.style.cssText = `
    width: 10px; height: 10px; border-radius: 50%;
    background: ${accent}; flex-shrink: 0;
  `

  const title = document.createElement("span")
  title.style.cssText = `font-weight: 700; font-size: 13px; letter-spacing: 0.04em; text-transform: uppercase; color: #94a3b8;`
  title.textContent = "Media Bias / Fact Check"

  headerLeft.appendChild(dot)
  headerLeft.appendChild(title)

  const closeBtn = document.createElement("button")
  closeBtn.id = "mbfc-close-btn"
  closeBtn.setAttribute("aria-label", "Close")
  closeBtn.style.cssText = `
    background: rgba(255,255,255,0.06);
    border: none; cursor: pointer; color: #94a3b8;
    border-radius: 6px; padding: 4px 8px; font-size: 16px;
    line-height: 1; transition: background 0.15s;
  `
  closeBtn.textContent = "✕"
  closeBtn.addEventListener("click", removeOverlay)

  header.appendChild(headerLeft)
  header.appendChild(closeBtn)

  // Body
  const body = document.createElement("div")
  body.style.cssText = `padding: 14px;`

  const biasLabel = document.createElement("div")
  biasLabel.style.cssText = `
    font-size: 22px; font-weight: 800; color: ${accent};
    margin-bottom: 6px; letter-spacing: -0.02em;
  `
  biasLabel.textContent = details.bias

  const desc = document.createElement("p")
  desc.style.cssText = `margin: 0 0 12px; color: #94a3b8; font-size: 13px; line-height: 1.55;`
  desc.textContent = details.biasDescription

  const link = document.createElement("a")
  link.href = details.mbfcLink
  link.rel = "noreferrer"
  link.target = "_blank"
  link.style.cssText = `font-size: 13px; display: inline-flex; align-items: center; gap: 4px;`
  link.innerHTML = `Read full report <span style="font-size:11px;">↗</span>`

  body.appendChild(biasLabel)
  body.appendChild(desc)
  body.appendChild(link)

  overlay.appendChild(bar)
  overlay.appendChild(header)
  overlay.appendChild(body)
  document.body.appendChild(overlay)

  // Auto-dismiss after 12 seconds
  setTimeout(removeOverlay, 12000)
}

function showUnrated() {
  removeOverlay()

  const overlay = document.createElement("div")
  overlay.id = OVERLAY_ID

  overlay.style.cssText = `
    position: fixed;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 2147483647;
    width: min(92vw, 360px);
    background: #0f172a;
    border: 1px solid #334155;
    border-radius: 12px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.6);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 14px;
    line-height: 1.5;
    color: #e2e8f0;
    overflow: hidden;
    animation: mbfc-slide-up 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  `

  const bar = document.createElement("div")
  bar.style.cssText = `height: 3px; background: #475569; width: 100%;`

  const body = document.createElement("div")
  body.style.cssText = `padding: 14px;`

  const heading = document.createElement("div")
  heading.style.cssText = `font-size: 16px; font-weight: 700; margin-bottom: 6px; color: #e2e8f0;`
  heading.textContent = "Not a rated site"

  const sub = document.createElement("p")
  sub.style.cssText = `margin: 0 0 10px; color: #94a3b8; font-size: 13px;`
  sub.textContent = "This site has not been reviewed by Media Bias/Fact Check."

  const link = document.createElement("a")
  link.href = "https://mediabiasfactcheck.com"
  link.rel = "noreferrer"
  link.target = "_blank"
  link.style.cssText = `color: #93c5fd; font-size: 13px; text-decoration: none;`
  link.textContent = "Browse all rated sites ↗"

  const closeBtn = document.createElement("button")
  closeBtn.style.cssText = `
    display: block; margin-top: 12px;
    background: rgba(255,255,255,0.06); border: none; cursor: pointer;
    color: #94a3b8; border-radius: 6px; padding: 6px 14px;
    font-size: 13px; width: 100%;
  `
  closeBtn.textContent = "Dismiss"
  closeBtn.addEventListener("click", removeOverlay)

  body.appendChild(heading)
  body.appendChild(sub)
  body.appendChild(link)
  body.appendChild(closeBtn)
  overlay.appendChild(bar)
  overlay.appendChild(body)
  document.body.appendChild(overlay)

  setTimeout(removeOverlay, 8000)
}

// Listen for messages from the background service worker
browser.runtime.onMessage.addListener((message: { type: string; payload?: PopupDetails }) => {
  if (message.type === "mbfc-show-overlay") {
    if (message.payload?.rated) {
      showOverlay(message.payload)
    } else {
      showUnrated()
    }
  }
})
