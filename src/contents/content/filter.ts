import { set } from "lodash"
import { Result, err, ok } from "neverthrow"

import { sendToBackground } from "@plasmohq/messaging"

import {
  ASSOCIATE_SITE,
  type AssociateSiteRequestBody,
  type AssociateSiteResponseBody,
  REPORT_UNKNOWN,
  RESET_IGNORED,
  type ReportUnknownRequestBody,
  type ReportUnknownResponseBody,
  type ResetIgnoredRequestBody,
  type ResetIgnoredResponseBody,
  SHOW_SITE,
  START_THANKS,
  type ShowSiteRequestBody,
  type ShowSiteResponseBody,
  type StartThanksRequestBody,
  type StartThanksResponseBody,
} from "~background/messages"
import { type CheckDomainResults } from "~background/utils"
import type { SiteModel } from "~models"
import { ConfigHandler, type ConfigStorage } from "~shared/config-handler"
import { faEye } from "~shared/elements/font-awesome"
import { isDevMode, logger } from "~shared/logger"

import { toggleStory } from "./utils/toggle-story"

import "./utils/report-div"

import { NewsAnnotation } from "./utils/report-div"

// import "./utils/hidden-div"

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
}

export class Filter {
  config: ConfigStorage
  unknown: any = {}
  loaded = false
  windowObjectReference: Window | null = null
  count = 0
  main_element: HTMLElement | null = null

  constructor(e: HTMLElement) {
    log(`Class Filter started`)
    this.main_element = e
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
      const all_nodes: HTMLElement[] = Array.from(this.findArticleElements(this.main_element)) as HTMLElement[]
      nodes.forEach((node) => {
        const addedNodes = Array.from(node.addedNodes)
        addedNodes.forEach((addedNode) => {
          const n: HTMLElement = addedNode as HTMLElement
          const pageletNodes = Array.from(this.findArticleElements(n))
          if (pageletNodes.length === 0) return
          pageletNodes.forEach((pageLet) => {
            const n: HTMLElement = pageLet as HTMLElement
            n.classList.add(C_PROCESSED)
            all_nodes.push(n)
          })
        })
      })
      if (all_nodes.length === 0) return
      const added = all_nodes.length
      log(`Processing ${added} nodes`)
      this.process(all_nodes)
        .then(() => {
          log(`Processed ${added} nodes`)
        })
        .catch((e) => console.error(e))
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

  waitForElementToDisplay(selector, time, cb) {
    const el = document.querySelector(selector)
    if (el != null) {
      cb(el)
    } else {
      setTimeout(() => {
        this.waitForElementToDisplay(selector, time, cb)
      }, time)
    }
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

  ignoreButton(text, count) {
    // const button = document.getElementById(`toolbar-button1-${count}`)
    // if (!button) return
    // const domain = button.attributes["data-domain"].value
    // const collapse = button.attributes["data-collapse"].value !== "show"
    // log(domain, button.attributes["data-collapse"].value, collapse)
    // const which = collapse ? "hiding" : "showing"
    // log(`Always ${which} ${text}/${domain}`)
    // new HideSiteMessage(domain, collapse).sendMessage()
    // const el = document.getElementById(`mbfcext${count}`)
    // if (el) {
    //   el.style.display = collapse ? "none" : "inherit"
    // }
    // const domain_class = `${MBFC}-${domain.replace(/\./g, "-")}`
    // if (collapse) {
    //   document.querySelectorAll(`.${domain_class}`).forEach((e) => {
    //     this.hideElement(e)
    //   })
    //   document.querySelectorAll(`button[data-domain="${domain}"]`).forEach((e) => {
    //     e.setAttribute("data-collapse", "show")
    //     e.textContent = e.textContent?.replace("hide", "show") || ""
    //   })
    // } else {
    //   document.querySelectorAll(`.${domain_class}`).forEach((e) => {
    //     this.showElement(e)
    //   })
    //   document.querySelectorAll(`button[data-domain="${domain}"]`).forEach((e) => {
    //     e.setAttribute("data-collapse", "hide")
    //     e.textContent = e.textContent?.replace("show", "hide") || ""
    //   })
    // }
    // alert(`Always ${which} ${text}/${domain}`)
    // const el2 = document.getElementById(`mbfctt${count}`)
    // if (!el2) return
    // if (el2.style.display == "none") {
    //   el2.style.display = "table-row"
    // } else {
    //   el2.style.display = "none"
    // }
  }

  async reportSite(site: SiteModel, collapse: boolean) {
    return sendToBackground<ShowSiteRequestBody, ShowSiteResponseBody>(SHOW_SITE, { site, collapse })
  }

  async reportUnknown(domain: string) {
    return sendToBackground<ReportUnknownRequestBody, ReportUnknownResponseBody>(REPORT_UNKNOWN, { domain })
  }

  async resetIgnored() {
    await sendToBackground<ResetIgnoredRequestBody, ResetIgnoredResponseBody>(RESET_IGNORED, {})
    alert(`OK, reset. You can now begin to hide/show individual sites`)
  }

  async reportAssociated(source: SiteModel, fb_url: string) {
    return sendToBackground<AssociateSiteRequestBody, AssociateSiteResponseBody>(ASSOCIATE_SITE, { source, fb_url })
  }

  async openRequestedPopup() {
    await sendToBackground<StartThanksRequestBody, StartThanksResponseBody>(START_THANKS, {})
    this.windowObjectReference = window.open("https://paypal.me/drmikecrowe", "DescriptiveWindowName", "resizable,scrollbars,status")
  }

  addButtons(text, count) {
    this.waitForElementToDisplay(`.toolbar-button1-${count}`, 500, (button) => {
      button.addEventListener("click", () => this.ignoreButton(text, count), false)
    })
    this.waitForElementToDisplay(`.toolbar-button2-${count}`, 500, (button) => {
      button.addEventListener("click", () => this.thanksButton(), false)
    })
    this.waitForElementToDisplay(`.toolbar-button3-${count}`, 500, (button) => {
      button.addEventListener("click", () => this.resetIgnored(), false)
    })
  }

  getHiddenDiv(story_class: string, hidden_id: string, count: number, collapse: boolean) {
    const hDiv = document.createElement("mbfc")
    hDiv.className = `mbfcext ${C_FOUND}`
    hDiv.id = hidden_id

    const span_id = `${story_class}-span`
    const hide_id = `${story_class}-icon`
    const hide_classes = `mbfc mbfc-hide-ctrl mbfc-hide-ctrl${count}`
    const hide = collapse
      ? `<div
            id="${hide_id}"
            class="${hide_classes}"
            style="cursor: pointer"
            ${faEye}
            <span id="${span_id}"> Show Anyway</span>
        </div>`
      : ""
    set(hDiv, "innerHTML", hide)
    return hDiv
  }

  getReportDiv(site: SiteModel, count: number, tagsearch: string, collapse: boolean, embed = false): Result<Element, null> {
    const iDiv = document.createElement("mbfc")
    iDiv.className = `mbfcext ${C_FOUND} ${C_REPORT_DIV}`
    iDiv.id = `mbfcext${count}`

    const na = new NewsAnnotation(site, iDiv)
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async buildStory(e: Element): Promise<Result<Story, null>> {
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

  async getStoryNodes(nodes: Element[]): Promise<Result<Story[], null>> {
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

  async inject(story: Story, embed = false) {
    if (!story.domain || !story.domain.site) {
      debugger
      log("ERROR: story.domain empty", story)
      return
    }
    if (story.parent.querySelector(MBFC)) {
      debugger
      log("ERROR: already injected", story)
      return
    }
    const { site, collapse } = story.domain
    const iDiv = this.getReportDiv(site, story.count, story.tagsearch, collapse, embed)
    if (iDiv.isErr()) {
      debugger
      log(`ERROR: iDiv empty for ${story.count}`, story)
      return
    }
    if (story.report_element) {
      const pn = story.report_element.parentNode
      if (pn) {
        pn.insertBefore(iDiv.value, story.report_element)
      } else {
        debugger
      }
    } else {
      debugger
    }
    // this.addButtons(site.n, story.count)
    const story_class = this.storyClass(story.count)
    const hide_id = `mbfcext-hide-${story.count}`
    const hDiv = this.getHiddenDiv(story_class, hide_id, story.count, collapse)
    story.parent.appendChild(hDiv)
    const hiddenDiv = document.getElementById(hide_id)
    hiddenDiv?.addEventListener("click", () => toggleStory(story_class))
    const domain_class = `${MBFC}-${story.domain.final_domain.replace(/\./g, "-")}`
    this.addClasses(story.parent, [domain_class, this.storyClass(story.count)])
    story.hides.forEach((e) => {
      this.addClasses(e, [domain_class, this.storyClass(story.count)])
    })
    if (collapse) {
      story.hides.forEach((e) => {
        this.hideElement(e)
      })
    }
    if (isDevMode()) {
      log(`inject-${story.count}`, story, story.parent)
    }
    try {
      await this.reportSite(story.domain.site, collapse)
    } catch (error) {
      console.error(`Could not report site ${story.domain.site.domain} #${story.count}`, error)
    }
  }

  async process(nodes: HTMLElement[]) {
    const stories: Story[] = []
    for (const node of nodes) {
      const res = await this.buildStory(node)
      if (res.isErr()) return
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
