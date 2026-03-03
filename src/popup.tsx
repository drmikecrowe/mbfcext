/**
 * Popup entry point - Minimal React wrapper for vanilla implementation
 * React is required by Plasmo, but all dynamic content uses vanilla DOM
 */

import { useEffect, useRef } from "react"

import { sendToBackground } from "@plasmohq/messaging"

import { getCurrentTab, getDomain } from "~shared"
import { AnglesRightIcon, GearIcon } from "~shared/elements/VanillaIcons"

import "./style.css"

import { GET_DOMAIN_FOR_TAB, type GetDomainForTabRequestBody, type GetDomainForTabResponseBody } from "~background/messages"

import { logger } from "./shared/logger"

const log = logger("mbfc:popup")

function clearContainer(container: HTMLElement): void {
  while (container.firstChild) {
    container.removeChild(container.firstChild)
  }
}

function renderRated(container: HTMLElement, bias: string, biasDescription: string, mbfcLink: string): void {
  clearContainer(container)

  const div = document.createElement("div")
  const h1 = document.createElement("h1")
  h1.className = "p-0 pb-2"
  h1.textContent = bias

  const p = document.createElement("p")
  p.className = "text-sm"
  p.textContent = biasDescription

  const a = document.createElement("a")
  a.className = "pt-2"
  a.href = mbfcLink
  a.rel = "noreferrer"
  a.target = "_blank"
  a.textContent = "Read the Media Bias/Fact Check detailed report\u00A0"
  a.appendChild(AnglesRightIcon(12))

  div.appendChild(h1)
  div.appendChild(p)
  div.appendChild(a)

  container.appendChild(div)
}

function renderUnrated(container: HTMLElement): void {
  clearContainer(container)

  const div = document.createElement("div")
  const h1 = document.createElement("h1")
  h1.className = "p-0 pb-2"
  h1.textContent = "Not a rated site"

  const p = document.createElement("p")
  p.textContent = "Feel free to view the full list of site rating and bias analysis at the"

  const a = document.createElement("a")
  a.className = "pt-2"
  a.href = "https://mediabiasfactcheck.com"
  a.rel = "noreferrer"
  a.target = "_blank"
  a.textContent = "Media Bias/Fact Check Website\u00A0"
  a.appendChild(AnglesRightIcon(12))

  div.appendChild(h1)
  div.appendChild(p)
  div.appendChild(a)

  container.appendChild(div)
}

function IndexPopup() {
  const containerRef = useRef<HTMLDivElement>(null)
  const gearButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const container = containerRef.current
    const gearButton = gearButtonRef.current

    if (!container || !gearButton) return

    // Add gear button handler and icon
    gearButton.addEventListener("click", () => {
      chrome.runtime.openOptionsPage()
    })
    gearButton.appendChild(GearIcon(14))

    // Fetch and display domain info
    const fetchAndDisplay = async () => {
      const ct = await getCurrentTab()
      if (ct.isErr()) {
        renderUnrated(container)
        return
      }

      const domain = getDomain(ct.value.url)
      const res = await sendToBackground<GetDomainForTabRequestBody, GetDomainForTabResponseBody>({
        name: GET_DOMAIN_FOR_TAB,
        body: { domain: domain.domain, path: domain.path },
      })

      if (!res || !res.site) {
        log("Error: No site returned")
        renderUnrated(container)
        return
      }

      const { site } = res
      if (site.rated) {
        renderRated(container, site.bias, site.biasDescription, site.mbfcLink)
      } else {
        renderUnrated(container)
      }
    }

    fetchAndDisplay().catch((err) => {
      console.error(err)
    })
  }, [])

  return (
    <div style={{ width: "500px", height: "250px" }}>
      <div className="container mx-auto p-2 centered">
        <div className="absolute top-0 right-0">
          <div className="p-1">
            <button ref={gearButtonRef} type="button"></button>
          </div>
        </div>
        <div className="clearfix" />
        <div ref={containerRef} className="pt-0"></div>
      </div>
    </div>
  )
}

export default IndexPopup
