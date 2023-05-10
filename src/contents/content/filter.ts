import { set } from "lodash"
import { Result, err, ok } from "neverthrow"

import { sendToBackground } from "@plasmohq/messaging"

import type { SiteModel } from "~models"
import { ConfigHandler, type ConfigStorage } from "~utils/config-handler"
import { faEye } from "~utils/elements/font-awesome"
import { isDevMode, logger } from "~utils/logger"

import { ASSOCIATE_SITE, type AssociateSiteRequestBody, type AssociateSiteResponseBody } from "../../background/messages/associate-site"
import { REPORT_UNKNOWN, type ReportUnknownRequestBody, type ReportUnknownResponseBody } from "../../background/messages/report-unknown"
import { RESET_IGNORED, type ResetIgnoredRequestBody, type ResetIgnoredResponseBody } from "../../background/messages/reset-ignored"
import { SHOW_SITE, type ShowSiteRequestBody, type ShowSiteResponseBody } from "../../background/messages/show-site"
import { START_THANKS, type StartThanksRequestBody, type StartThanksResponseBody } from "../../background/messages/start-thanks"
import { type CheckDomainResults } from "../../background/utils"
import { cap } from "./utils/cap"
import { toggleStory } from "./utils/toggle-story"

import "./utils/report-div"
import "./utils/hidden-div"

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
}

export class Filter {
  config: ConfigStorage
  unknown: any = {}
  loaded = false
  windowObjectReference: Window | null = null
  count = 0

  constructor() {
    log(`Class Filter started`)
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

    const observer = new MutationObserver(() => {
      ;(async () => {
        const pageletNodes = Array.from(this.findArticleElements())

        if (pageletNodes.length === 0) return
        pageletNodes.forEach((pageLet) => {
          const n: HTMLElement = pageLet as HTMLElement
          n.classList.add(C_PROCESSED)
        })
        await this.process(pageletNodes as HTMLElement[])
      })().catch((err) => {
        console.error(err)
      })
    })

    observer.observe(document, {
      childList: true,
      subtree: true,
      attributes: false,
      characterData: false,
    })
  }

  findArticleElements(): NodeListOf<Element> {
    throw new Error("Must be overloaded")
  }

  addClasses(e: Element, cls: string[]) {
    cls.forEach((c) => {
      if (!e.classList.contains(c)) e.classList.add(c)
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

    const na = new NewsAnnotation()
    na.bias = cap(site.bias)
    if (site.reporting) {
      na.reporting = cap(site.reporting)
    }
    if (site.credibility) {
      na.credibility = cap(site.credibility)
    }
    if (site.traffic) {
      na.traffic = cap(site.traffic)
    }
    if (site.popularity) {
      na.popularity = `${site.popularity}`
    }
    na.domain = site.domain
    const t = na.render()
    console.log(t)
    debugger

    // const mtype = biasShortToName[site.b]
    // const external_link = `&nbsp;${faExternalLinkAlt}`
    // const hide = get(config, site.d) || collapse
    // const prompt = hide ? "show" : "hide"
    // const toolbar = `<div>
    //             <button id="toolbar-button1-${count}" class="mbfc-drop-down mbfc-button-success mbfc-right-spacer toolbar-button1-${count}" data-domain="${site.d}" data-collapse="${prompt}">Always ${prompt} ${site.n}</button><span class="spacer">&nbsp;</span>
    //             <button class="mbfc-drop-down mbfc-button-warning toolbar-button3-${count}">Reset Hidden Sites</button>
    //             <button style="float: right; margin-right: 20px;" class="mbfc-drop-down mbfc-button-secondary toolbar-button2-${count}">Say Thanks</button>
    //         </div>`
    // const bias_display = biases[mtype].name.replace(/ Bias(ed)?/, "")
    // const bias_link = `<span class="mbfc-td-text">${bias_display}`
    // const details: string[] = []
    // if (site.r > "") {
    //   if (has(EReportingText, site.r)) {
    //     details.push(EReportingText[site.r])
    //   }
    // }
    // if (site.c > "" && site.c !== "NA") {
    //   details.push(ECredibility[site.c])
    // }
    // if (site.a > "" && site.a !== "N") {
    //   details.push(ETraffic[site.a])
    // }
    // if (site.P) {
    //   details.push(`<span title="Within our rated sites, this site has ${site.P}% higher number of sites linking to it than other sites">Links: ${site.P}%</span>`)
    // }
    // if (tagsearch && mtype !== "satire") {
    //   details.push(
    //     `<a title="Search factualsearch.news for '${tagsearch}'" target="_blank" href="https://factualsearch.news/#gsc.tab=0&fns.type=mostly-center&gsc.q=${encodeURIComponent(
    //       tagsearch,
    //     )}">Research ${external_link}</a> `,
    //   )
    // }
    // const mbfc_url = site.u.startsWith("https") ? site.u : `${C_URL}${site.u}`
    // details.push(
    //   `<a title="Open MediaBiasFactCheck.com for ${site.n}" target="_blank" href="${mbfc_url}">
    //                 MBFC ${external_link}
    //             </a>`,
    // )
    // const inline_code = `el=document.getElementById('mbfctt${count}'); if (el.style.display=='none') { el.style.display='table-row'; } else { el.style.display='none'; }`
    // const drop_down = embed
    //   ? ""
    //   : `<td width="20px" align="center"><div
    //             class="mbfc-drop-down"
    //             onclick="${inline_code}">${faAngleDoubleDown}</div></td>`
    // const buildNormalColumns = () => {
    //   const tdl = mtype === "left" ? bias_link : "&nbsp;"
    //   const tdlc = mtype === "left-center" ? bias_link : "&nbsp;"
    //   const tdc = mtype === "center" ? bias_link : "&nbsp;"
    //   const tdrc = mtype === "right-center" ? bias_link : "&nbsp;"
    //   const tdr = mtype === "right" ? bias_link : "&nbsp;"
    //   return `
    //                 <td width="20%" class="mbfc-td mbfc-td-left">${tdl}</td>
    //                 <td width="20%" class="mbfc-td mbfc-td-left-center">${tdlc}</td>
    //                 <td width="20%" class="mbfc-td mbfc-td-center">${tdc}</td>
    //                 <td width="20%" class="mbfc-td mbfc-td-right-center">${tdrc}</td>
    //                 <td width="20%" class="mbfc-td mbfc-td-right">${tdr}</td>
    //             `
    // }
    // const buildOtherColumns = () => {
    //   return `
    //                 <td width="10%" class="mbfc-td mbfc-td-${mtype}">&nbsp;</td>
    //                 <td width="10%" class="mbfc-td mbfc-td-${mtype}">&nbsp;</td>
    //                 <td width="60%" class="mbfc-td mbfc-td-${mtype}">${bias_link}</td>
    //                 <td width="10%" class="mbfc-td mbfc-td-${mtype}">&nbsp;</td>
    //                 <td width="10%" class="mbfc-td mbfc-td-${mtype}">&nbsp;</td>
    //             `
    // }
    // let columns
    // switch (biasShortToName[site.b]) {
    //   case "satire":
    //   case "conspiracy":
    //   case "fake-news":
    //   case "pro-science":
    //     columns = buildOtherColumns()
    //     break
    //   default:
    //     columns = buildNormalColumns()
    //     break
    // }
    // const details_contents = `<div class="mbfc-details mbfc-td mbfc-td-text">
    //             ${details.join(", &nbsp;")}
    //         </div>`
    // const table = `
    // <div style="border-bottom: 1px solid var(--divider); margin-right: 20px; margin-left: 5px;">
    //     <table class="mbfc-table-table" cellpadding="0" border="0">
    //         <tbody>
    //             <tr>
    //                 ${columns}${drop_down}
    //             </tr>
    //             <tr id="mbfctt${count}" class="mbfc-td-text" style="display:none">
    //                 <td colspan="6">
    //                     ${toolbar}
    //                 </td>
    //             </tr>
    //             <tr>
    //                 <td colspan="6" align="center">
    //                     ${details_contents}
    //                 </td>
    //             </tr>
    //         </tbody>
    //     </table>
    // </div>
    // `
    // set(iDiv, "innerHTML", table)
    return ok(iDiv)
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
    let all = true
    for (let i = 1; i < e_list.length; i++) {
      if (!pe.contains(e_list[i])) {
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
      return
    }
    if (story.parent.querySelector(MBFC)) {
      return
    }
    story.count = this.count
    this.count += 1
    const { site, collapse } = story.domain
    const iDiv = this.getReportDiv(site, story.count, story.tagsearch, collapse, embed)
    if (iDiv.isErr()) {
      log("ERROR: iDiv empty")
      return
    }
    if (story.report_element) {
      const pn = story.report_element.parentNode
      if (pn) pn.insertBefore(iDiv.value, story.report_element)
    }
    // this.addButtons(site.n, story.count)
    const story_class = this.storyClass(story.count)
    const hide_id = `mbfcext-hide-${story.count}`
    const hDiv = this.getHiddenDiv(story_class, hide_id, story.count, collapse)
    story.parent.appendChild(hDiv)
    const hiddenDiv = document.getElementById(hide_id)
    hiddenDiv?.addEventListener("click", () => toggleStory(story_class))
    const domain_class = `${MBFC}-${story.domain.final_domain.replace(/\./g, "-")}`
    story.hides.forEach((e) => {
      this.addClasses(e, [domain_class, this.storyClass(story.count)])
    })
    if (collapse) {
      story.hides.forEach((e) => {
        this.hideElement(e)
      })
    }
    await this.reportSite(story.domain.site, collapse)
  }

  async process(nodes: HTMLElement[]) {
    const stories: Story[] = []
    for (const node of nodes) {
      const res = await this.buildStory(node)
      if (res.isErr()) return
      stories.push(res.value)
    }
    for (const story of stories) {
      if (story.ignored) return
      await this.inject(story)
    }
  }
}
