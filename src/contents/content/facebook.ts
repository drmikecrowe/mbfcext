/* eslint-disable no-param-reassign */
import { Result, err, ok } from "neverthrow"

import { sendToBackground } from "@plasmohq/messaging"

import { GET_DOMAIN_FOR_FILTER, type GetDomainForFilterRequestBody, type GetDomainForFilterResponseBody } from "~background/messages"
import { CollapseKeys, ConfigHandler } from "~shared"
import { isDevMode, logger } from "~shared/logger"

import { C_FOUND, C_PROCESSED, Filter, MBFC, type Story } from "./filter"

isDevMode()
const log = logger("mbfc:facebook")

interface DomainSort {
  domain: string
  count: number
  html: HTMLElement
}

const domain_re = /(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]/g

export class Facebook extends Filter {
  private static instance: Facebook
  observer = null

  constructor() {
    super(`div[role='main']`)

    log(`Class Facebook started`)
  }

  static getInstance(): Facebook {
    if (!Facebook.instance) {
      Facebook.instance = new Facebook()
    }
    return Facebook.instance
  }

  findArticleElements(e: HTMLElement): NodeListOf<Element> {
    if (!e || !e.querySelectorAll) return [] as any
    return e.querySelectorAll(`div[role='article'][aria-posinset]:not(.${C_PROCESSED})`)
  }

  findTitleElement(e: HTMLElement): HTMLAnchorElement | undefined {
    // Title element is the first link in the article
    return e.querySelector(`a[role='link']`)
  }

  findLikeButtons(e: HTMLElement): HTMLElement | undefined {
    return e.querySelector('div[data-visualcompletion="ignore-dynamic"]')
  }

  findSponsored(e: HTMLElement): HTMLElement | undefined {
    return e.querySelector('span > span > a[aria-label="Sponsored"]')
  }

  findDomainSpan(e: HTMLElement): DomainSort | undefined {
    const domains: Record<string, DomainSort> = {}
    Array.from(e.querySelectorAll(`span[dir='auto'] > span:not(:has(*))`)).forEach((el) => {
      const text = el.textContent
      if (!text) return
      const domain = text.split(" ")[0]
      if (!domain_re.test(domain)) return
      if (domains[domain]) {
        domains[domain].count += 1
      } else {
        domains[domain] = {
          domain,
          count: 1,
          html: el as HTMLElement,
        }
      }
    })
    const keys = Object.keys(domains)
    if (keys.length === 0) return undefined
    const domain = keys.reduce((a, b) => (domains[a].count > domains[b].count ? a : b))
    return domains[domain]
  }

  findPossibleFbPage(e: HTMLElement): string | undefined {
    const elem = e.querySelector("h3 span > a[href*='https://www.facebook.com']") as HTMLAnchorElement
    if (elem) {
      return this.clean_path(elem)
    }
  }

  findPossibleName(e: HTMLElement): string | undefined {
    const elem = e.querySelector("h3 span > a > strong > span") as HTMLSpanElement
    if (elem) {
      return elem.textContent
    }
  }

  async buildStory(parent: HTMLElement): Promise<Result<Story, string>> {
    if (parent.classList.contains(`${MBFC}-story-searched`)) return err(null)
    const story: Story = {
      title_element: this.findTitleElement(parent),
      report_element: this.findLikeButtons(parent),
      parent,
      hides: [],
      count: this.count,
      ignored: false,
      sponsored: false,
      possible_page: this.findPossibleFbPage(parent),
      possible_name: this.findPossibleName(parent),
    }
    this.count += 1
    const sponsored = this.findSponsored(parent)
    if (sponsored) {
      if (ConfigHandler.getInstance().config.collapse[CollapseKeys.collapseSponsored]) {
        story.sponsored = true
        this.addClasses(parent, [MBFC, `${MBFC}-sponsored`])
      }
    }
    if (!story.title_element || !story.title_element.href || !story.report_element) {
      log(`${MBFC}-no-title-element for ${story.count}`, story)
      this.addClasses(parent, [MBFC, `${MBFC}-no-title-element`, C_PROCESSED])
      return err(`${MBFC}-no-title-element`)
    }

    const sections: HTMLElement[] = [story.title_element, story.report_element]

    const dr = this.findDomainSpan(parent)
    if (dr) {
      story.domain_element = dr.html
      story.possible_domain = dr.domain
      sections.push(dr.html)
    }
    const e3 = this.findParent(sections)
    if (!e3) {
      log(`${MBFC}-no-parent for ${story.count}`, story)
      this.addClasses(parent, [MBFC, `${MBFC}-no-parent`])
      return err(`${MBFC}-no-parent`)
    }
    story.parent = e3

    const story_children = Array.from(story.parent.children)
    if (story_children.length < 2) {
      log(`${MBFC}-no-children for ${story.count}`, story)
      this.addClasses(parent, [MBFC, `${MBFC}-no-children`])
      return err(`${MBFC}-no-children`)
    }

    const title_holder = story_children.filter((e) => e.contains(story.title_element as Node)).shift()
    const report_holder = story_children.filter((e) => e.contains(story.report_element as Node)).shift()
    if (!title_holder || !report_holder) {
      log(`${MBFC}-no-report-holder for ${story.count}`, story)
      this.addClasses(story.parent, [MBFC, `${MBFC}-no-report-holder`])
      return err(`${MBFC}-no-report-holder`)
    }
    this.addClasses(parent, [MBFC, C_PROCESSED, C_FOUND, `${MBFC}-story-searched`, this.storyClass(story.count)])
    story.title_holder = title_holder as HTMLElement
    story.report_holder = report_holder as HTMLElement

    if (!story.sponsored) {
      const payload: GetDomainForFilterRequestBody = {
        fb_path: this.clean_path(story.title_element),
        possible_domain: story.possible_domain,
      }
      log(`Sending ${GET_DOMAIN_FOR_FILTER} request 1`, payload)
      let res = await sendToBackground<GetDomainForFilterRequestBody, GetDomainForFilterResponseBody>({
        name: GET_DOMAIN_FOR_FILTER,
        body: payload,
      })
      if ((!res || !res.site) && story.possible_page) {
        payload.fb_path = story.possible_page
        log(`Sending ${GET_DOMAIN_FOR_FILTER} request 2`, payload)
        res = await sendToBackground<GetDomainForFilterRequestBody, GetDomainForFilterResponseBody>({
          name: GET_DOMAIN_FOR_FILTER,
          body: payload,
        })
      }
      if ((!res || !res.site) && story.possible_name) {
        if (!story.possible_page) {
          payload.fb_path = undefined
        }
        payload.possible_name = story.possible_name.toLowerCase()
        log(`Sending ${GET_DOMAIN_FOR_FILTER} request 3`, payload)
        res = await sendToBackground<GetDomainForFilterRequestBody, GetDomainForFilterResponseBody>({
          name: GET_DOMAIN_FOR_FILTER,
          body: payload,
        })
        if (res && res.site && story.possible_page) {
          res.domain.suggested_fbtwpath = story.possible_page
        }
      }

      if (!res || !res.site) {
        log(`${MBFC}-no-domain for ${story.count}`, story)
        this.addClasses(parent, [MBFC, `${MBFC}-no-domain`])
        return err(`${MBFC}-no-domain`)
      }

      story.domain = res.domain
      if (res.domain && res.domain.suggested_fbtwpath) {
        log(`NEW: I think this is ${res.domain.suggested_fbtwpath}`)
        await this.reportAssociated(res.site, story.possible_page)
      }
    }

    const ignore = new Set([title_holder, report_holder])
    story.hides = story_children.filter((e) => !ignore.has(e))
    const report_displays = story.report_element.querySelectorAll("div[class]:not([class=''])")
    const report_divs = this.findFirstDivsWithNonEmptyClass(report_displays)
    report_divs.forEach((e) => {
      // if (e.contains(report)) return;
      story.hides.push(e)
    })
    this.addClasses(story.parent, [MBFC, `${MBFC}-story-block`])
    if (isDevMode()) {
      log(`${MBFC}-story-block for ${story.count}`, story, story.parent)
    }
    return ok(story)
  }
}
