import { faAngleDoubleDown as dblSvg, faExternalLinkAlt as extSvg, faEye as eyeSvg } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import debug from "debug"
import { Result, err, ok } from "neverthrow"
import { onMessage, sendMessage } from "webext-bridge/devtools"

import type { SourceData } from "~background/sources-processor"
import { CheckDomainResults, getSiteFromUrl } from "~background/utils"
import { BiasEnums } from "~models"
import { ConfigStorage, isDevMode } from "~utils"

const faEye = FontAwesomeIcon({ icon: eyeSvg })
const faExternalLinkAlt = FontAwesomeIcon({ icon: extSvg })
const faAngleDoubleDown = FontAwesomeIcon({ icon: dblSvg })

export const MBFC = "mbfc"
export const C_URL = "https://mediabiasfactcheck.com/"
export const C_FOUND = `${MBFC}-found`
export const C_REPORT_DIV = `${MBFC}-report-div`
export const C_PARENT = `${MBFC}-parent`
export const QS_PROCESSED_SEARCH = ":scope > mbfc"

export interface Story {
  domain_results?: CheckDomainResults
  parent: HTMLElement
  report?: HTMLElement
  top?: HTMLElement
  hides: HTMLElement[]
  count: number
  tagsearch?: string
  ignored: boolean
}

export interface ElementList {
  domain?: CheckDomainResults
  items: HTMLElement[]
  block?: HTMLElement
  object?: HTMLElement
  domain_span?: HTMLElement
  title_span?: HTMLElement
  used: boolean
  internal_url?: string
  is_twitter_handle: boolean
}

isDevMode()
const log = debug("mbfc:filter")

export class Filter {
  config: ConfigStorage | undefined
  sources: SourceData | undefined
  unknown: any = {}
  loaded = false
  windowObjectReference: Window | null = null
  count = 0

  constructor() {
    log(`Class Filter started`)
    onMessage("updated-config", ({ data }) => {
      if (data) this.config = data
    })
    onMessage("updated-sources", ({ data }) => {
      if (data) this.sources = data
    })
    log(`MutationObserver started`)

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        const parents: HTMLElement[] = []

        const handleNodes = (newNodes: NodeList) => {
          if (newNodes !== null) {
            newNodes.forEach((n) => {
              const p = n.parentElement
              if (!p) return
              if (p.id.startsWith("mount")) return
              if (p.tagName === "DIV") {
                if (parents.filter((pe) => pe !== p)) parents.push(p)
              }
            })
          }
        }

        handleNodes(mutation.addedNodes)
        this.cleanMbfcNodes(mutation.removedNodes)
        handleNodes(mutation.removedNodes)
        if (parents.length) this.process(parents)
      })
    })

    observer.observe(document, {
      childList: true,
      subtree: true,
      attributes: false,
      characterData: false,
    })
  }

  cleanMbfcNodes(qn: NodeList | HTMLElement[]) {
    qn.forEach((qne: Node) => {
      const e: HTMLElement = qne as HTMLElement
      if (!e.querySelectorAll) return
      if (!e.querySelector(`.${MBFC}`)) return
      if (e.tagName === "MBFC") {
        if (e.parentElement) this.cleanMbfcNodes([e.parentElement])
        e.remove()
      } else {
        e.querySelectorAll(MBFC).forEach((mbfc) => {
          mbfc.remove()
        })
        e.querySelectorAll(`.${MBFC}`).forEach((p) => {
          p.classList.forEach((cls) => {
            if (cls.startsWith(MBFC)) p.classList.remove(cls)
          })
        })
      }
    })
  }

  addClasses(e: HTMLElement, cls: string[]) {
    cls.forEach((c) => {
      if (!e.classList.contains(c)) e.classList.add(c)
    })
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  process(_parents: HTMLElement[]) {
    throw new Error("Must be overloaded")
  }

  waitForElementToDisplay(selector: string, time: number, cb: (e: HTMLElement) => void) {
    const el: HTMLElement = document.querySelector(selector)
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

  hideElement(el: HTMLElement) {
    if (el && el.tagName !== "MBFC") {
      el.style.display = "none"
    }
  }

  showElement(el: HTMLElement) {
    if (el) {
      el.style.display = "inherit"
    }
  }

  thanksButton() {
    this.openRequestedPopup()
  }

  ignoreButton(text: string, count: number) {
    if (!this.config) return
    const button = document.getElementById(`toolbar-button1-${count}`)
    if (!button) return
    const domain = button.attributes["data-domain"].value
    const collapse = button.attributes["data-collapse"].value !== "show"
    log(domain, button.attributes["data-collapse"].value, collapse)
    const which = collapse ? "hiding" : "showing"
    log(`Always ${which} ${text}/${domain}`)
    sendMessage("hide-site", { domain, collapse }).then(() => log(`Site ${domain} hidden=${collapse}`))
    const el = document.getElementById(`mbfcext${count}`)
    if (el) {
      el.style.display = collapse ? "none" : "inherit"
    }
    const domain_class = `${MBFC}-${domain.replace(/\./g, "-")}`
    if (collapse) {
      document.querySelectorAll(`.${domain_class}`).forEach((e: HTMLElement) => {
        this.hideElement(e)
      })
      document.querySelectorAll(`button[data-domain="${domain}"]`).forEach((e) => {
        e.setAttribute("data-collapse", "show")
        e.textContent = e.textContent?.replace("hide", "show") || ""
      })
    } else {
      document.querySelectorAll(`.${domain_class}`).forEach((e: HTMLElement) => {
        this.showElement(e)
      })
      document.querySelectorAll(`button[data-domain="${domain}"]`).forEach((e) => {
        e.setAttribute("data-collapse", "hide")
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
  }

  reportSite(domain: string, isAlias: boolean, isBase: boolean, isCollapsed: boolean) {
    sendMessage("show-site", { domain, isAlias, isBase, isCollapsed }).then(() => log(`Domain shown: ${domain}, ia=${isAlias}, ib=${isBase}, c=${isCollapsed}`))
  }

  reportUnknown(domain: string) {
    sendMessage("unknown-site", { domain }).then(() => log(`Domain unknown: ${domain}`))
  }

  resetIgnored() {
    sendMessage("reset-ignored", {}).then(() => {
      alert(`OK, reset. You can now begin to hide/show individual sites`)
    })
  }

  reportAssociated(new_domain: string, domain: string) {
    sendMessage("associate-site", { new_domain, domain }).then(() => log(`New domain ${new_domain} associated with ${domain}`))
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getDomainNode(_e: HTMLElement, _top_node: HTMLElement): Result<ElementList, null> {
    throw new Error("Must be overridden")
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getObjectNode(_e: HTMLElement, _top_node: HTMLElement): Result<ElementList, null> {
    throw new Error("Must be overridden")
  }

  mergeNodes(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _domain_nodes: ElementList[], // Valid stories where we know the domain
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _object_nodes: ElementList[], // Possible stories that might match domain_nodes, but may be new ones too
  ): Story[] {
    throw new Error("Must be overridden")
  }

  openRequestedPopup() {
    sendMessage("reset-ignored", {}).then(() => (this.windowObjectReference = window.open("https://paypal.me/drmikecrowe", "DescriptiveWindowName", "resizable,scrollbars,status")))
  }

  addButtons(text: any, count: number) {
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

  findDomain(el_list: ElementList, e?: HTMLElement, text_input?: string) {
    if (text_input) {
      const text = text_input.toLowerCase().split(" ")[0]
      if (text.indexOf(".") > -1) {
        const res = getSiteFromUrl(text, this.sources, this.config)
        if (res.isOk()) {
          el_list.domain = res.value
          return
        }
      }
    }
    if (!e) return
    // Here we see if the domain span is a plain-text link rather than a domain name
    const pe: HTMLElement = e.parentElement?.parentElement
    if (pe) {
      const href = (pe as any).href
      if (href) {
        this.findDomain(el_list, undefined, href)
        if (el_list.domain) {
          el_list.internal_url = text_input
        }
      }
    }
  }

  getHiddenDiv(domain: string, count: number, collapse: boolean) {
    if (!this.sources) return
    const site = this.sources.sites_by_domain[domain]
    if (!site) return
    const hDiv = document.createElement("mbfc")
    hDiv.className = `mbfcext ${C_FOUND}`
    hDiv.id = `mbfcext-hide-${count}`

    const story_class = this.storyClass(count)
    const span_id = `${story_class}-span`
    const icon_id = `${story_class}-icon`
    const hide_classes = `mbfc mbfc-hide-ctrl mbfc-hide-ctrl${count}`
    const inlineCode = `
            var icon=document.getElementById('${icon_id}'),
                span=document.getElementById('${span_id}');
            Array.from(document.getElementsByClassName('${story_class}')).forEach(function(e) {
                if(e && e.style) {
                    if (e.style.display === 'none') {
                        e.style.display = 'block';
                        icon.classList.remove('fa-eye');
                        icon.classList.add('fa-eye-slash');
                        span.textContent=' Hide'
                    } else {
                        e.style.display = 'none';
                        icon.classList.remove('fa-eye-slash');
                        icon.classList.add('fa-eye');
                        span.textContent=' Show'
                    }
                }
            });
        `
    const hide = collapse
      ? `<div
                class="${hide_classes}"
                style="cursor: pointer"
                onclick="${inlineCode}">
                ${faEye}
                <span id="${span_id}"> Show Anyway</span>
            </div>`
      : ""
    if (hide) debugger // TODO: Check if faEye can become a string
    hDiv.innerHTML = hide
    return hDiv
  }

  getReportDiv(domain: string, count: number, tagsearch: string, collapse: boolean, embed = false): Result<HTMLElement, null> {
    if (!this.config || !this.sources) return err(null)
    const config = this.config
    const site = this.sources.sites_by_domain[domain]
    if (!site) return err(null)

    const { traffic: traffic_def, biases: bias_def, reporting: reporting_def, credibility: credibility_def } = this.sources.combined

    const iDiv = document.createElement("mbfc")
    iDiv.className = `mbfcext ${C_FOUND} ${C_REPORT_DIV}`
    iDiv.id = `mbfcext${count}`

    const external_link = `&nbsp;${faExternalLinkAlt}`

    const hide = (domain in config.hiddenSites && !config.hiddenSites[domain]) || collapse
    const prompt = hide ? "show" : "hide"

    const toolbar = `<div>
            <button id="toolbar-button1-${count}" class="mbfc-drop-down mbfc-button-success mbfc-right-spacer toolbar-button1-${count}" data-domain="${site.domain}" data-collapse="${prompt}">Always ${prompt} ${site.name}</button><span class="spacer">&nbsp;</span>
            <button class="mbfc-drop-down mbfc-button-warning toolbar-button3-${count}">Reset Hidden Sites</button>
            <button style="float: right; margin-right: 20px;" class="mbfc-drop-down mbfc-button-secondary toolbar-button2-${count}">Say Thanks</button>
        </div>`

    const details: string[] = []

    const { bias, reporting, credibility, traffic, popularity, url, name } = site

    const bd = bias_def.find((b) => b.bias === bias)
    const bias_display = bd.pretty.replace(/ Bias(ed)?/, "")
    const bias_link = `<span class="mbfc-td-text">${bias_display}`

    const rd = reporting_def.find((r) => r.reporting === reporting)
    if (rd) {
      details.push(rd.pretty)
    }

    const cd = credibility_def.find((c) => c.credibility === credibility)
    if (cd) {
      details.push(cd.pretty)
    }

    const td = traffic_def.find((t) => t.traffic === traffic)
    if (td) {
      details.push(td.pretty)
    }

    if (popularity) {
      details.push(`<span title="Within our rated sites, this site has ${popularity}% higher number of sites linking to it than other sites">Links: ${popularity}%</span>`)
    }

    if (tagsearch && bias !== "satire") {
      details.push(
        `<a title="Search factualsearch.news for '${tagsearch}'" target="_blank" href="https://factualsearch.news/#gsc.tab=0&fns.type=mostly-center&gsc.q=${encodeURIComponent(
          tagsearch,
        )}">Research ${external_link}</a> `,
      )
    }
    const mbfc_url = url.startsWith("https") ? url : `${C_URL}${url}`
    details.push(`<a title="Open MediaBiasFactCheck.com for ${name}" target="_blank" href="${mbfc_url}">MBFC's ${external_link}</a>`)

    const inline_code = `el=document.getElementById('mbfctt${count}'); if (el.style.display=='none') { el.style.display='table-row'; } else { el.style.display='none'; }`
    const drop_down = embed
      ? ""
      : `<td width="20px" align="center"><div
            class="mbfc-drop-down"
            onclick="${inline_code}">${faAngleDoubleDown}</div></td>`

    const buildNormalColumns = (): string => {
      const tdl = bias === "left" ? bias_link : "&nbsp;"
      const tdlc = bias === "left-center" ? bias_link : "&nbsp;"
      const tdc = bias === "center" ? bias_link : "&nbsp;"
      const tdrc = bias === "right-center" ? bias_link : "&nbsp;"
      const tdr = bias === "right" ? bias_link : "&nbsp;"

      return `
                <td width="20%" class="mbfc-td mbfc-td-left">${tdl}</td>
                <td width="20%" class="mbfc-td mbfc-td-left-center">${tdlc}</td>
                <td width="20%" class="mbfc-td mbfc-td-center">${tdc}</td>
                <td width="20%" class="mbfc-td mbfc-td-right-center">${tdrc}</td>
                <td width="20%" class="mbfc-td mbfc-td-right">${tdr}</td>
            `
    }

    const buildOtherColumns = (): string => {
      return `
                <td width="10%" class="mbfc-td mbfc-td-${bias}">&nbsp;</td>
                <td width="10%" class="mbfc-td mbfc-td-${bias}">&nbsp;</td>
                <td width="60%" class="mbfc-td mbfc-td-${bias}">${bias_link}</td>
                <td width="10%" class="mbfc-td mbfc-td-${bias}">&nbsp;</td>
                <td width="10%" class="mbfc-td mbfc-td-${bias}">&nbsp;</td>
            `
    }

    let columns: string

    switch (bias) {
      case BiasEnums.Satire:
      case BiasEnums.ConspiracyPseudoscience:
      case BiasEnums.FakeNews:
      case BiasEnums.ProScience:
        columns = buildOtherColumns()
        break
      default:
        columns = buildNormalColumns()
        break
    }

    const details_contents = `<div class="mbfc-details mbfc-td mbfc-td-text">
            ${details.join(", &nbsp;")}
        </div>`

    const table = `
<div class="">
    <table class="mbfc-table-table" cellpadding="0" border="0">
        <tbody>
            <tr>
                ${columns}${drop_down}
            </tr>
            <tr id="mbfctt${count}" class="mbfc-td-text" style="display:none">
                <td colspan="6">
                    ${toolbar}
                </td>
            </tr>
            <tr>
                <td colspan="6" align="center">
                    ${details_contents}
                </td>
            </tr>
        </tbody>
    </table>
</div>
`

    iDiv.innerHTML = table
    return ok(iDiv)
  }

  getResults(e: HTMLElement, top_node: HTMLElement): ElementList {
    const results: ElementList = {
      items: [e],
      used: false,
      is_twitter_handle: false,
    }
    let t = e.parentElement
    while (t && t !== top_node) {
      results.items.unshift(t)
      t = t?.parentElement
    }
    return results
  }

  getStoryNodes(nodes: HTMLElement[], qs_articles: string, qs_domain_search: string, qs_object_search?: string): Result<Story[], null> {
    try {
      const results: Story[] = []
      if (this.sources) {
        nodes.forEach((node) => {
          node.querySelectorAll(qs_articles).forEach((top_node: HTMLElement) => {
            const domain_nodes: ElementList[] = []
            const object_nodes: ElementList[] = []
            Array.from(top_node.querySelectorAll(qs_domain_search)).forEach((e: HTMLElement) => {
              const res = this.getDomainNode(e, top_node)
              if (res.isOk()) {
                domain_nodes.push(res.value)
              }
            })
            if (qs_object_search) {
              Array.from(top_node.querySelectorAll(qs_object_search)).forEach((e: HTMLElement) => {
                const res = this.getObjectNode(e, top_node)
                if (res.isOk()) {
                  object_nodes.push(res.value)
                }
              })
            }
            if (domain_nodes.length + object_nodes.length > 0) {
              const stories = this.mergeNodes(domain_nodes, object_nodes)
              results.push(...stories)
            }
          })
        })
      }
      return ok(results)
    } catch (err1) {
      console.log(err1)
      // ignore
      if (isDevMode()) debugger
    }
    return err(null)
  }

  inject(story: Story, embed = false) {
    if (!story.domain_results || !story.domain_results.site) {
      return
    }
    if (story.parent.querySelector(MBFC)) {
      return
    }
    story.count = this.count++
    const { site, collapse } = story.domain_results
    const iDiv = this.getReportDiv(site.domain, story.count, story.tagsearch, collapse, embed)
    if (iDiv.isErr()) {
      log("ERROR: iDiv empty")
      return
    }
    if (story.report) story.parent.insertBefore(iDiv.value, story.report)
    this.addButtons(site.domain, story.count)
    const hDiv = this.getHiddenDiv(site.domain, story.count, collapse)
    story.parent.appendChild(hDiv)
    const domain_class = `${MBFC}-${story.domain_results.final_domain.replace(/\./g, "-")}`
    story.hides.forEach((e) => {
      this.addClasses(e, [domain_class, this.storyClass(story.count)])
    })
    if (collapse) {
      story.hides.forEach((e) => {
        this.hideElement(e)
      })
    }
    this.reportSite(site.domain, story.domain_results.alias, story.domain_results.baseUrl, collapse)
  }
}
