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
        const all_nodes: HTMLElement[] = Array.from(this.findArticleElements(this.main_element)) as HTMLElement[]
        const unattachedButtons = document.querySelectorAll('button.mbfc-toolbar-button[data-attached="false"]')
        if (unattachedButtons.length > 0) {
          this.processUnattachedButtons(unattachedButtons)
        }
        if (all_nodes.length === 0) return
        const added = all_nodes.length
        log(`Processing ${added} nodes`)
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
    const button = document.getElementById(`mbfc-toolbar-button1-${count}`)
    if (!button) return
    const domain = button.attributes["data-domain"].value
    const collapse = button.attributes["data-collapse"].value !== "Show"
    log(domain, button.attributes["data-collapse"].value, collapse)
    const which = collapse ? "hiding" : "showing"
    sendToBackground<HideSiteRequestBody, HideSiteResponseBody>({ name: HIDE_SITE, body: { domain, collapse } })
      .then(() => {
        log(`Always ${which} ${text}/${domain}`)
        const el = document.getElementById(`mbfcext${count}`)
        if (el) {
          el.style.display = collapse ? "none" : "inherit"
        }
        const domain_class = `${MBFC}-${domain.replace(/\./g, "-")}`
        if (collapse) {
          document.querySelectorAll(`.${domain_class}`).forEach((e) => {
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
          button.addEventListener("click", () => this.ignoreButton(button.attributes["data-domain"].value, button.attributes["data-count"].value), false)
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

  getHiddenDiv(hide_class: string, count: number, collapse: boolean) {
    const hDiv = document.createElement("mbfc")
    hDiv.className = `mbfcext ${C_FOUND}`

    const show_eye_id = `${hide_class}-show-eye`
    const hide_eye_id = `${hide_class}-hide-eye`
    const hide_id = `${hide_class}-icon`
    const hide_classes = `mbfc mbfc-hide-ctrl mbfc-hide-ctrl${count}`

    const inlineCode = `
            let icon_show=document.getElementById('${show_eye_id}'), icon_hide=document.getElementById('${hide_eye_id}');     
            let show = icon_show.style.display !== 'none';       
            let new_story_display = show ? 'inherit' : 'none';    
            Array.from(document.getElementsByClassName('${hide_class}')).forEach(function(e) {
                e.style.display = new_story_display;
            });
            icon_show.style.display = show ? 'none' : 'block';
            icon_hide.style.display = show ? 'block' : 'none';
        `.replace(/\s+/g, " ")

    const hide = collapse
      ? `<mbfc><div
            id="${hide_id}"
            class="${hide_classes}"
            onclick="${inlineCode}"
            style="cursor: pointer; padding-left: 2px;">
            <span id="${hide_eye_id}" style="display: none">${faEyeSlash} Hide Again</span>
            <span id="${show_eye_id}">${faEye} Show Anyway</span>
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
    if (story.report_element) {
      const pn = story.report_element.parentNode
      if (pn && reportElem) {
        pn.insertBefore(reportElem, story.report_element)
      }
    }
    const hide_class = `mbfcext-hide-${story.count}`
    const hDiv = this.getHiddenDiv(hide_class, story.count, hide_this_story)
    this.addClasses(hDiv, [MBFC])
    story.parent.appendChild(hDiv)
    story.hides.forEach((e) => {
      this.addClasses(e, [MBFC, hide_class])
    })
    if (hide_this_story) {
      story.hides.forEach((e) => {
        this.hideElement(e)
      })
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

  async process(nodes: HTMLElement[]) {
    const stories: Story[] = []
    for (const node of nodes) {
      const res = await this.buildStory(node)
      if (res.isErr()) {
        continue
      }
      stories.push(res.value)
    }
    const promises = stories.filter((s) => !s.ignored).map((s) => this.inject(s))
    try {
      await Promise.allSettled(promises)
    } catch (error) {
      console.error(error)
    }
  }
}
