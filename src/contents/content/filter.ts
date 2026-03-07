import { Result, err, ok } from "neverthrow"

import { Storage } from "@plasmohq/storage"

import { type CheckDomainResults } from "~background/utils"
import type { SiteModel } from "~models"
import { BiasEnums } from "~models"
import { CollapseKeys, ConfigHandler, type ConfigStorage, StorageToOptions } from "~shared/config-handler"
import { faEye, faEyeSlash } from "~shared/elements/font-awesome"
import { isDevMode, logger } from "~shared/logger"

import "./utils/report-div"

/**
 * Safely insert HTML into an element using DOMParser instead of insertAdjacentHTML.
 * This avoids Firefox's UNSAFE_VAR_ASSIGNMENT warnings while still handling SVG content.
 */
function safeInsertHTML(element: Element, position: InsertPosition, html: string): void {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, "text/html")
  const fragment = document.createDocumentFragment()

  // Collect nodes to insert (body children for HTML fragments)
  const nodes = Array.from(doc.body.childNodes)
  for (const node of nodes) {
    fragment.appendChild(node.cloneNode(true))
  }

  switch (position) {
    case "afterbegin":
      element.insertBefore(fragment, element.firstChild)
      break
    case "beforeend":
      element.appendChild(fragment)
      break
    case "beforebegin":
      element.parentNode?.insertBefore(fragment, element)
      break
    case "afterend":
      element.parentNode?.insertBefore(fragment, element.nextSibling)
      break
  }
}

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

    let debounceTimer: ReturnType<typeof setTimeout> | null = null
    let idleCallbackId: number | null = null
    let mutationCount = 0
    let lastMutationTime = Date.now()

    const DEBOUNCE_MS = 300 // Increased from 150ms to batch more mutations
    const IDLE_TIMEOUT_MS = 1000 // Increased from 200ms to allow more idle time
    const RAPID_MUTATION_THRESHOLD = 50 // If we see this many mutations in DEBOUNCE_MS, extend wait

    const processMutations = () => {
      try {
        if (!this.main_element) {
          this.main_element = document.querySelector(this.main_selector)
          // Fallback to document body if main selector not found (e.g., search pages)
          if (!this.main_element) {
            this.main_element = document.body
          }
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
        const unattachedSettings = document.querySelectorAll('.mbfc-inline-settings [data-attached="false"]')
        if (unattachedSettings.length > 0) {
          this.processUnattachedSettings(unattachedSettings)
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
    }

    const scheduleProcessing = () => {
      const now = Date.now()
      const timeSinceLastMutation = now - lastMutationTime

      // If mutations are coming in rapidly, extend the debounce period
      // This prevents processing during heavy page load
      const debounceTime = mutationCount > RAPID_MUTATION_THRESHOLD ? DEBOUNCE_MS * 2 : DEBOUNCE_MS

      // Reset mutation count if enough time has passed
      if (timeSinceLastMutation > debounceTime) {
        mutationCount = 0
      }

      if (debounceTimer) {
        clearTimeout(debounceTimer)
      }

      // Cancel any pending idle callback
      if (idleCallbackId !== null && 'cancelIdleCallback' in window) {
        window.cancelIdleCallback(idleCallbackId)
        idleCallbackId = null
      }

      debounceTimer = setTimeout(() => {
        debounceTimer = null

        // Use requestIdleCallback for non-urgent processing
        if ('requestIdleCallback' in window) {
          idleCallbackId = window.requestIdleCallback(
            (deadline) => {
              idleCallbackId = null
              // Only process if we have enough time or if deadline has passed
              if (deadline.timeRemaining() > 0 || deadline.didTimeout) {
                processMutations()
              } else {
                // Reschedule if we don't have enough idle time
                scheduleProcessing()
              }
            },
            { timeout: IDLE_TIMEOUT_MS }
          )
        } else {
          processMutations()
        }
      }, debounceTime)
    }

    const observer = new MutationObserver(() => {
      lastMutationTime = Date.now()
      mutationCount++
      scheduleProcessing()
    })

    observer.observe(document, {
      childList: true,
      subtree: true,
      attributes: false,
      characterData: false,
    })

    // Setup watchers for collapse setting changes
    this.setupCollapseWatchers()
  }

  /**
   * Setup storage watchers to toggle story visibility when collapse settings change.
   * This allows real-time updates when users change settings in the Options page.
   */
  setupCollapseWatchers() {
    const storage = new Storage()

    // Map of collapse keys to bias enums for finding matching stories
    const collapseToBiasMap: Record<string, string> = {
      [CollapseKeys.collapseLeft]: BiasEnums.Left,
      [CollapseKeys.collapseLeftCenter]: BiasEnums.LeftCenter,
      [CollapseKeys.collapseCenter]: BiasEnums.Center,
      [CollapseKeys.collapseRightCenter]: BiasEnums.RightCenter,
      [CollapseKeys.collapseRight]: BiasEnums.Right,
      [CollapseKeys.collapseProScience]: BiasEnums.ProScience,
      [CollapseKeys.collapseConspiracy]: BiasEnums.ConspiracyPseudoscience,
      [CollapseKeys.collapseSatire]: BiasEnums.Satire,
      [CollapseKeys.collapseFakeNews]: BiasEnums.FakeNews,
    }

    // Watch each collapse key for changes
    Object.entries(collapseToBiasMap).forEach(([collapseKey, biasEnum]) => {
      storage.watch({
        [collapseKey]: (change: { newValue: any }) => {
          const shouldCollapse = this.parseStorageValue(change.newValue)
          log(`Collapse setting ${collapseKey} changed to ${shouldCollapse}, updating stories with bias ${biasEnum}`)
          this.toggleStoriesByBias(biasEnum, shouldCollapse)
        },
      })
    })

    // Watch for Mixed credibility changes
    storage.watch({
      [CollapseKeys.collapseMixed]: (change: { newValue: any }) => {
        const shouldCollapse = this.parseStorageValue(change.newValue)
        log(`Collapse setting collapseMixed changed to ${shouldCollapse}, updating stories with mixed reporting`)
        this.toggleStoriesByReporting("M", shouldCollapse)
      },
    })

    // Watch for Sponsored changes
    storage.watch({
      [CollapseKeys.collapseSponsored]: (change: { newValue: any }) => {
        const shouldCollapse = this.parseStorageValue(change.newValue)
        log(`Collapse setting collapseSponsored changed to ${shouldCollapse}, updating sponsored stories`)
        this.hide_sponsored = shouldCollapse
        this.toggleSponsoredStories(shouldCollapse)
      },
    })
  }

  /**
   * Parse a storage value that might be a raw boolean or JSON string.
   */
  private parseStorageValue(value: any): boolean {
    if (typeof value === "boolean") return value
    if (typeof value === "string") {
      try {
        return JSON.parse(value)
      } catch {
        return false
      }
    }
    return false
  }

  /**
   * Toggle visibility of all stories with a specific bias type.
   */
  private toggleStoriesByBias(biasEnum: string, shouldCollapse: boolean) {
    // Find all story containers with this bias
    const storyContainers = document.querySelectorAll(`.mbfc-annotation-container[data-bias="${biasEnum}"]`)
    log(`Found ${storyContainers.length} stories with bias ${biasEnum}`)

    storyContainers.forEach((container) => {
      const parentMbfc = container.closest("mbfc")
      if (parentMbfc) {
        // Find the parent article element (the one with hide classes)
        const articleElement = parentMbfc.parentElement
        if (articleElement) {
          // Find the hide class for this story
          const hideClasses = Array.from(articleElement.classList).filter(c => c.startsWith("mbfcext-hide-"))
          hideClasses.forEach(hideClass => {
            // Toggle all elements with this hide class
            const elementsToToggle = document.querySelectorAll(`.${hideClass}`)
            elementsToToggle.forEach((el) => {
              if (shouldCollapse) {
                this.hideElement(el as HTMLElement)
              } else {
                this.showElement(el as HTMLElement)
              }
            })
          })

          // Also toggle the report_holder (the div between mbfc elements)
          const reportHolder = parentMbfc.nextElementSibling as HTMLElement
          if (reportHolder && reportHolder.tagName !== "MBFC") {
            if (shouldCollapse) {
              this.hideElement(reportHolder)
            } else {
              this.showElement(reportHolder)
            }
          }
        }
      }

      // Update the hide/show control button
      const hideCtrl = container.querySelector(".mbfc-hide-ctrl") as HTMLElement
      if (hideCtrl) {
        const isCurrentlyHidden = hideCtrl.getAttribute("data-hidden") === "true"
        if (isCurrentlyHidden !== shouldCollapse) {
          hideCtrl.setAttribute("data-hidden", shouldCollapse ? "true" : "false")
          const spanEl = hideCtrl.querySelector("span")
          if (spanEl) {
            spanEl.textContent = shouldCollapse ? "Show Anyway" : "Hide"
          }
        }
      }
    })
  }

  /**
   * Toggle visibility of stories with Mixed factual reporting.
   */
  private toggleStoriesByReporting(reporting: string, shouldCollapse: boolean) {
    const storyContainers = document.querySelectorAll(`.mbfc-annotation-container[data-reporting="${reporting}"]`)
    log(`Found ${storyContainers.length} stories with reporting ${reporting}`)

    storyContainers.forEach((container) => {
      const bias = container.getAttribute("data-bias")
      if (bias) {
        // Use the bias-based toggle which handles the full logic
        this.toggleStoriesByBias(bias, shouldCollapse)
      }
    })
  }

  /**
   * Toggle visibility of sponsored stories.
   */
  private toggleSponsoredStories(shouldCollapse: boolean) {
    // Sponsored stories don't have a bias, they're marked differently
    // Find all elements with sponsored-related classes
    const sponsoredElements = document.querySelectorAll("[data-sponsored]")
    log(`Found ${sponsoredElements.length} sponsored elements`)

    sponsoredElements.forEach((el) => {
      if (shouldCollapse) {
        this.hideElement(el as HTMLElement)
      } else {
        this.showElement(el as HTMLElement)
      }
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
      el.style.display = "none"
    }
  }

  showElement(el) {
    if (el) {
      el.style.display = "inherit"
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
    this.windowObjectReference = window.open("https://paypal.me/drmikecrowe", "DescriptiveWindowName", "noopener,noreferrer,resizable,scrollbars,status")
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
        // Update icon and text using safe HTML insertion for SVG
        const icon = isHidden ? faEyeSlash : faEye
        const text = isHidden ? "Hide Again" : "Show Anyway"
        hideCtrl.textContent = ""
        safeInsertHTML(hideCtrl, "afterbegin", icon + " ")
        const newSpan = document.createElement("span")
        newSpan.textContent = text
        hideCtrl.appendChild(newSpan)
      }, false)
      log(`Added hide control event listener for ${hideClass}`)
      hideCtrl.attributes.removeNamedItem("data-attached")
    }
  }

  processUnattachedSettings(elems: NodeListOf<Element>) {
    for (const elem of elems as HTMLElement[]) {
      const type = elem.attributes["data-type"]?.value
      const setting = elem.attributes["data-setting"]?.value

      if (setting) {
        // Handle checkbox settings with data-setting attribute
        elem.addEventListener("change", async (e) => {
          const checked = (e.target as HTMLInputElement).checked
          const storage = new Storage()
          await storage.set(setting, checked)
          log(`Set ${setting} to ${checked}`)
          // Show refresh message for annotation bar setting
          if (setting === "disableAnnotationBar") {
            alert("Please refresh the page for this change to take effect.")
          }
        })
      } else if (type === "open-options") {
        // Handle options link
        elem.addEventListener("click", (e) => {
          e.preventDefault()
          chrome.runtime.openOptionsPage()
        })
      }
      elem.attributes.removeNamedItem("data-attached")
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
    safeInsertHTML(hDiv, "afterbegin", hide)
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
    safeInsertHTML(iDiv, "afterbegin", html)
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

    // Skip annotation bar injection if disabled (unless it's a sponsored story which has different handling)
    if (this.config.disableAnnotationBar && !story.sponsored) {
      log(`Skipping annotation bar for story ${story.count} - disabled in settings`)
      return
    }

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
