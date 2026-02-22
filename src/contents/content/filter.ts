import { set } from "lodash"
import { Result, err, ok } from "neverthrow"

import { type CheckDomainResults } from "~background/utils"
import type { SiteModel } from "~models"
import { CollapseKeys, ConfigHandler, type ConfigStorage } from "~shared/config-handler"
import { faEye, faEyeSlash } from "~shared/elements/font-awesome"
import { isDevMode, logger } from "~shared/logger"

import "./utils/report-div"

import { sendToBackground } from "@plasmohq/messaging"

import { HIDE_SITE, type HideSiteRequestBody, type HideSiteResponseBody, RESET_IGNORED, ResetIgnoredRequestBody, ResetIgnoredResponseBody } from "~background/messages"
import { GoogleAnalytics } from "~shared/google-analytics"

import { NewsAnnotation } from "./utils/report-div"

export const MBFC = "mbfc"
export const C_URL = "https://mediabiasfactcheck.com/"
export const C_FOUND = `${MBFC}-found`
export const C_PROCESSED = `${MBFC}-processed`
export const C_REPORT_DIV = `${MBFC}-report-div`
export const C_PARENT = `${MBFC}-parent`
export const QS_PROCESSED_SEARCH = ":scope > mbfc"

const log = logger("mbfc:content:filter")

export interface Story {
  domain?: CheckDomainResults
  parent: Element
  report_element?: HTMLElement
  title_element?: HTMLAnchorElement
  domain_element?: HTMLElement
  report_holder?: HTMLElement
  title_holder?: HTMLElement
  domain_holder?: HTMLElement
  possible_domain?: string
  possible_page?: string
  possible_name?: string
  hides: Element[]
  count: number
  tagsearch?: string
  ignored: boolean
  sponsored: boolean
}

export class Filter {
  config: ConfigStorage
  unknown: any = {}
  loaded = false
  windowObjectReference: Window | null = null
  count = 0
  main_selector: string
  main_element: HTMLElement | null = null
  hide_sponsored = false

  constructor(e: string) {
    log(`Class Filter started`)
    this.main_selector = e
    const c = ConfigHandler.getInstance()
    c.retrieve()
      .then(() => {
        this.config = ConfigHandler.getInstance().config
        this.startMutationObserver()
      })
      .catch((e) => log(e))
  }

  startMutationObserver() {
    log(`MutationObserver started`)

    const observer = new MutationObserver((nodes) => {
      try {
        if (!this.main_element) {
          this.main_element = document.querySelector(this.main_selector)
          if (!this.main_element) return
        }
        NewsAnnotation.load_styles()
        const all_nodes: HTMLElement[] = Array.from(this.findArticleElements(this.main_element)) as HTMLElement[]
        const unattachedButtons = document.querySelectorAll('button.mbfc-toolbar-button[data-attached="false"]')
        if (unattachedButtons.length > 0) {
          this.processUnattachedButtons(unattachedButtons)
        }
        const unattachedDropdowns = document.querySelectorAll('.mbfc-dropdown-toggle[data-attached="false"]')
        if (unattachedDropdowns.length > 0) {
          this.processUnattachedDropdowns(unattachedDropdowns)
        }
        const unattachedHideCtrls = document.querySelectorAll('.mbfc-hide-ctrl[data-attached="false"]')
        if (unattachedHideCtrls.length > 0) {
          this.processUnattachedHideCtrls(unattachedHideCtrls)
        }
        if (all_nodes.length === 0) return
        const added = all_nodes.length
        this.process(all_nodes)
          .then(() => {
            log(`Processed ${added} nodes`)
          })
          .catch((e) => console.error(e))
      } catch (error) {
        console.log(error)
      }
    })

    observer.observe(document, {
      childList: true,
      subtree: true,
      attributes: false,
      characterData: false,
    })
  }

  findArticleElements(_e: HTMLElement): NodeListOf<Element> {
    throw new Error("Must be overloaded")
  }

  addClasses(e: Element, cls: string[]) {
    cls.forEach((c) => {
      if (!e.classList.contains(c)) e.classList.add(c)
    })
  }

  removeClasses(e: Element, cls: string[]) {
    cls.forEach((c) => {
      if (e.classList.contains(c)) e.classList.remove(c)
    })
  }

  storyClass(count: number): string {
    return `${MBFC}-story-${count}`
  }

  hideElement(el) {
    if (el && el.tagName !== "MBFC") {
      set(el, "style.display", "none")
    }
  }

  showElement(el) {
    if (el) {
      set(el, "style.display", "inherit")
    }
  }

  async thanksButton() {
    return this.openRequestedPopup()
  }

  async reportSite(source: SiteModel, collapse: boolean) {
    if (collapse) {
      return GoogleAnalytics.getInstance().reportCollapseSite(source.domain)
    }
    return GoogleAnalytics.getInstance().reportShowSite(source.domain)
  }

  async reportUnknown(domain: string) {
    GoogleAnalytics.getInstance().reportUnknownSite(domain)
  }

  async resetIgnored() {
    sendToBackground<ResetIgnoredRequestBody, ResetIgnoredResponseBody>({ name: RESET_IGNORED, body: {} })
      .then(() => {
        log(`Reset ignored sites`)
      })
      .catch((e) => {
        log(`Error resetting ignored sites: ${e}`)
      })
  }

  async reportAssociated(source: SiteModel, fb_url: string) {
    GoogleAnalytics.getInstance().reportAssociateSite(source.domain, fb_url)
  }

  async openRequestedPopup() {
    GoogleAnalytics.getInstance().reportStartThanks()
    this.windowObjectReference = window.open("https://paypal.me/drmikecrowe", "DescriptiveWindowName", "resizable,scrollbars,status")
  }

  ignoreButton(text, count) {
    log(`ignoreButton called with text=${text}, count=${count}`)
    const button = document.getElementById(`mbfc-toolbar-button1-${count}`)
    if (!button) {
      log(`Button not found for count ${count}`)
      return
    }
    const domain = button.attributes["data-domain"].value
    const collapse = button.attributes["data-collapse"].value !== "Show"
    log(`Domain: ${domain}, collapse: ${collapse}, data-collapse attr: ${button.attributes["data-collapse"].value}`)
    const which = collapse ? "hiding" : "showing"
    sendToBackground<HideSiteRequestBody, HideSiteResponseBody>({ name: HIDE_SITE, body: { domain, collapse } })
      .then(() => {
        log(`sendToBackground resolved for ${domain}`)
        log(`Always ${which} ${text}/${domain}`)
        const el = document.getElementById(`mbfcext${count}`)
        if (el) {
          el.style.display = collapse ? "none" : "inherit"
        }
        const domain_class = `${MBFC}-${domain.replace(/\./g, "-")}`
        log(`Looking for elements with class ${domain_class} to ${which}`)
        if (collapse) {
          const elements = document.querySelectorAll(`.${domain_class}`)
          log(`Found ${elements.length} elements with class ${domain_class}`)
          elements.forEach((e) => {
            log(`Hiding element:`, e.tagName, e.className)
            this.hideElement(e)
          })
          document.querySelectorAll(`button[data-domain="${domain}"]`).forEach((e) => {
            e.setAttribute("data-collapse", "Show")
            e.textContent = e.textContent?.replace("hide", "show") || ""
          })
        } else {
          document.querySelectorAll(`.${domain_class}`).forEach((e) => {
            this.showElement(e)
          })
          document.querySelectorAll(`button[data-domain="${domain}"]`).forEach((e) => {
            e.setAttribute("data-collapse", "Hide")
            e.textContent = e.textContent?.replace("show", "hide") || ""
          })
        }
        alert(`Always ${which} ${text}/${domain}`)
        const el2 = document.getElementById(`mbfctt${count}`)
        if (!el2) return
        if (el2.style.display == "none") {
          el2.style.display = "table-row"
        } else {
          el2.style.display = "none"
        }
      })
      .catch((e) => {
        log(`Error ${which} ${text}/${domain}: ${e}`)
      })
  }

  processUnattachedButtons(elems: NodeListOf<Element>) {
    for (const button of elems as never as HTMLButtonElement[]) {
      const type = button.attributes["data-type"].value
      switch (type) {
        case "ignore":
          button.addEventListener("click", (e) => {
            log(`Ignore button clicked for domain=${button.attributes["data-domain"].value}`)
            this.ignoreButton(button.attributes["data-domain"].value, button.attributes["data-count"].value)
          }, false)
          break
        case "thanks":
          button.addEventListener("click", () => this.thanksButton(), false)
          break
        case "reset":
          button.addEventListener("click", () => this.resetIgnored(), false)
          break
      }
      log(`Added ${type} button event listeners to ${button.id}`)
      button.attributes.removeNamedItem("data-attached")
    }
  }

  processUnattachedDropdowns(elems: NodeListOf<Element>) {
    for (const dropdown of elems as HTMLElement[]) {
      const count = dropdown.attributes["data-count"].value
      const domain = dropdown.attributes["data-domain"]?.value
      dropdown.addEventListener("click", () => {
        const el = document.getElementById(`mbfc-story-expanded-${count}`)
        if (el) {
          const isExpanding = el.style.display === "none"
          el.style.display = isExpanding ? "block" : "none"
          // Track dropdown expansion
          if (isExpanding) {
            GoogleAnalytics.getInstance().reportUIInteraction("dropdown-expanded", domain)
          }
        }
      }, false)
      log(`Added dropdown event listener for count ${count}`)
      dropdown.attributes.removeNamedItem("data-attached")
    }
  }

  processUnattachedHideCtrls(elems: NodeListOf<Element>) {
    for (const hideCtrl of elems as HTMLElement[]) {
      const hideClass = hideCtrl.attributes["data-hide-class"].value
      const domain = hideCtrl.attributes["data-domain"]?.value

      hideCtrl.addEventListener("click", () => {
        const isHidden = hideCtrl.attributes["data-hidden"].value === "true"
        const newStoryDisplay = isHidden ? "inherit" : "none"

        document.querySelectorAll(`.${hideClass}`).forEach((e) => {
          (e as HTMLElement).style.display = newStoryDisplay
        })

        // Also toggle report_holder visibility
        // Find the report_holder by looking for the sibling between the two mbfc elements
        const parentMbfc = hideCtrl.closest("mbfc")?.previousElementSibling
        if (parentMbfc) {
          const reportHolder = parentMbfc.nextElementSibling as HTMLElement
          if (reportHolder && reportHolder.tagName !== "MBFC") {
            reportHolder.style.display = newStoryDisplay
          }
        }

        // Track show-anyway clicks
        if (isHidden) {
          GoogleAnalytics.getInstance().reportUIInteraction("show-anyway", domain)
        }

        // Update button text and icon
        hideCtrl.setAttribute("data-hidden", isHidden ? "false" : "true")
        const spanEl = hideCtrl.querySelector("span")
        if (spanEl) {
          spanEl.textContent = isHidden ? "Hide Again" : "Show Anyway"
        }
        // Update icon (it's the first text node before the span)
        hideCtrl.innerHTML = (isHidden ? faEyeSlash : faEye) + ` <span>${isHidden ? "Hide Again" : "Show Anyway"}</span>`
      }, false)
      log(`Added hide control event listener for ${hideClass}`)
      hideCtrl.attributes.removeNamedItem("data-attached")
    }
  }

  getHiddenDiv(hide_class: string, count: number, collapse: boolean, domain?: string) {
    const hDiv = document.createElement("mbfc")
    hDiv.className = `mbfcext ${C_FOUND}`

    const hide_id = `${hide_class}-icon`
    const hide_classes = `mbfc mbfc-hide-ctrl mbfc-hide-ctrl${count}`

    const hide = collapse
      ? `<mbfc style="padding: 8px; text-align: center;"><div
            id="${hide_id}"
            class="${hide_classes}"
            data-attached="false"
            data-hide-class="${hide_class}"
            data-hidden="true"
            data-domain="${domain || ''}"
            style="cursor: pointer; display: inline-block; padding: 4px 12px; border-radius: 16px; background: #e4e6eb; font-size: 12px; margin-bottom: 10px;">
            ${faEye} <span>Show Anyway</span>
        </div></mbfc>`
      : ""
    set(hDiv, "innerHTML", hide)
    return hDiv
  }

  getReportDiv(site: SiteModel, count: number, tagsearch: string, collapse: boolean, embed = false): Result<Element, null> {
    const iDiv = document.createElement("mbfc")
    iDiv.className = `mbfcext ${C_FOUND} ${C_REPORT_DIV}`
    iDiv.id = `mbfcext${count}`

    const na = new NewsAnnotation(site, iDiv, count, collapse)
    const html = na.render()
    if (typeof html !== "string") {
      return err(null)
    }
    iDiv.innerHTML = html
    return ok(iDiv)
  }

  clean_href(e1: HTMLAnchorElement) {
    const u = new URL(e1.href)
    return `${u.protocol}//${u.hostname}${u.pathname}`
  }

  clean_domain(e1: HTMLAnchorElement) {
    const u = new URL(e1.href)
    return `${u.hostname}`
  }

  clean_path(e1: HTMLAnchorElement) {
    const u = new URL(e1.href)
    return `${u.pathname}`.toLowerCase().replace(/^\/?([^/?]*)[/?]?$/, "$1")
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async buildStory(e: Element): Promise<Result<Story, any>> {
    throw new Error("Must be overridden")
  }

  findParent(e_list: HTMLElement[]): HTMLElement | null {
    if (!e_list) return null
    const e = e_list.shift()
    if (!e) return null
    const pe = e.parentElement
    if (!pe) return null
    let all = pe.tagName == "DIV"
    for (const el of e_list) {
      if (!pe.contains(el)) {
        all = false
        break
      }
    }
    if (all) return pe
    return this.findParent([pe, ...e_list])
  }

  findFirstDivsWithNonEmptyClass(elements): Set<Element> {
    const result: Set<Element> = new Set()
    for (let i = 0; i < elements.length; i++) {
      let found = false
      for (const r of result) {
        if (r.contains(elements[i])) {
          found = true
          break
        }
      }
      if (!found) result.add(elements[i])
    }
    return result
  }

  async getStoryNodes(nodes: Element[]): Promise<Result<Story[], string>> {
    try {
      const results: Story[] = []
      for (const node of nodes) {
        const res = await this.buildStory(node)
        if (res.isOk()) {
          results.push(res.value)
        }
      }
      return ok(results.filter((r) => !!r.domain))
    } catch (err1) {
      console.log(err1)
      // ignore
      if (isDevMode()) debugger
    }
    return err(null)
  }

  async loadConfig() {
    const c = await ConfigHandler.getInstance().loadStorage()
    this.hide_sponsored = c.collapse[CollapseKeys.collapseSponsored]
    this.loaded = true
  }

  async inject(story: Story, embed = false) {
    if (!this.loaded) await this.loadConfig()

    let hide_this_story = story.sponsored && this.hide_sponsored

    if (hide_this_story) {
      log(`Sponsored story -- will hide`, story)
    }

    if (!hide_this_story && (!story.domain || !story.domain.site)) {
      if (!hide_this_story) {
        log("ERROR: story.domain empty", story)
        return
      }
    }
    if (!hide_this_story && story.parent.querySelector(MBFC)) {
      log("ERROR: already injected", story)
      return
    }

    let reportElem: Element | null = null

    if (!story.sponsored) {
      const { site, collapse } = story.domain
      if (collapse) hide_this_story = true
      const iDiv = this.getReportDiv(site, story.count, story.tagsearch, collapse || story.sponsored, embed)
      if (iDiv.isErr()) {
        log(`ERROR: iDiv empty for ${story.count}`, story)
        return
      }
      reportElem = iDiv.value
      const story_class = this.storyClass(story.count)
      const domain_class = `${MBFC}-${story.domain.final_domain.replace(/\./g, "-")}`
      this.addClasses(story.parent, [MBFC, domain_class, story_class])
      story.hides.forEach((e) => {
        this.addClasses(e, [MBFC, domain_class])
      })
    }
    if (story.report_holder && reportElem) {
      // Insert BEFORE the report_holder (like buttons container) as a sibling
      // This places the MBFC bar above the like buttons at the correct level
      story.parent.insertBefore(reportElem, story.report_holder)
      // Add domain class to report_holder (the div between the two mbfc tags) so it hides when domain is collapsed
      // Do this AFTER insert to ensure we have the right element
      if (!story.sponsored) {
        const domain_class = `${MBFC}-${story.domain.final_domain.replace(/\./g, "-")}`
        log(`Adding domain class ${domain_class} to report_holder for story ${story.count}`)
        this.addClasses(story.report_holder, [MBFC, domain_class])
      }
    }
    const hide_class = `mbfcext-hide-${story.count}`
    const domain = story.sponsored ? undefined : story.domain.final_domain
    const hDiv = this.getHiddenDiv(hide_class, story.count, hide_this_story, domain)
    this.addClasses(hDiv, [MBFC])
    story.parent.appendChild(hDiv)
    story.hides.forEach((e) => {
      this.addClasses(e, [MBFC, hide_class])
    })
    if (hide_this_story) {
      story.hides.forEach((e) => {
        this.hideElement(e)
      })
      // Also hide report_holder (the div between the two mbfc tags)
      if (story.report_holder) {
        this.hideElement(story.report_holder)
      }
    }
    if (isDevMode()) {
      log(`inject-${story.count}`, story, story.parent)
    }
    try {
      if (story.sponsored) {
        GoogleAnalytics.getInstance().reportSponsoredHide()
      } else {
        await this.reportSite(story.domain.site, hide_this_story)
      }
    } catch (error) {
      console.error(`Could not report site ${story.domain.site.domain} #${story.count}`, error)
    }
  }

  async preProcess(node: HTMLElement) {
    const res = await this.buildStory(node)
    if (res.isErr()) {
      return
    }
    const story = res.value
    if (story.ignored) return
    return this.inject(story)
  }

  async process(nodes: HTMLElement[]) {
    const promises: Promise<void>[] = nodes.map((n) => this.preProcess(n))
    try {
      await Promise.allSettled(promises)
    } catch (error) {
      console.error(error)
    }
  }
}
