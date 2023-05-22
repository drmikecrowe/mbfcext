/* eslint-disable no-param-reassign */
import { Result, err, ok } from "neverthrow"

import { sendToBackground } from "@plasmohq/messaging"

import { GET_DOMAIN_FOR_FILTER, type GetDomainForFilterRequestBody, type GetDomainForFilterResponseBody } from "~background/messages"
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
    super(document.querySelector(`a[role='main']`))

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

  async buildStory(parent: HTMLElement): Promise<Result<Story, null>> {
    if (parent.classList.contains(`${MBFC}-story-searched`)) return err(null)
    const story: Story = {
      title_element: this.findTitleElement(parent),
      report_element: this.findLikeButtons(parent),
      parent,
      hides: [],
      count: this.count,
      ignored: false,
    }
    this.count += 1
    this.addClasses(parent, [C_FOUND, `${MBFC}-story-searched`, this.storyClass(story.count)])
    if (!story.title_element || !story.title_element.href || !story.report_element) {
      log(`${MBFC}-no-title-element for ${story.count}`, story)
      this.addClasses(parent, [`${MBFC}-no-title-element`])
      return err(null)
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
      this.addClasses(parent, [`${MBFC}-no-parent`])
      return err(null)
    }
    story.parent = e3

    const story_children = Array.from(story.parent.children)
    if (story_children.length < 2) {
      log(`${MBFC}-no-children for ${story.count}`, story)
      this.removeClasses(parent, [C_FOUND, `${MBFC}-story-searched`])
      return err(null)
    }

    const title_holder = story_children.filter((e) => e.contains(story.title_element as Node)).shift()
    const report_holder = story_children.filter((e) => e.contains(story.report_element as Node)).shift()
    if (!title_holder || !report_holder) {
      log(`${MBFC}-no-report-holder for ${story.count}`, story)
      this.addClasses(story.parent, [`${MBFC}-no-report-holder`])
      return err(null)
    }
    story.title_holder = title_holder as HTMLElement
    story.report_holder = report_holder as HTMLElement

    const payload: GetDomainForFilterRequestBody = {
      fb_path: this.clean_href(story.title_element),
      possible_domain: story.possible_domain,
    }
    const res = await sendToBackground<GetDomainForFilterRequestBody, GetDomainForFilterResponseBody>({
      name: GET_DOMAIN_FOR_FILTER,
      body: payload,
    })
    if (!res || !res.site) {
      log(`${MBFC}-no-domain for ${story.count}`, story)
      this.addClasses(parent, [`${MBFC}-no-domain`])
      return err(null)
    }

    story.domain = res.domain

    const ignore = new Set([title_holder, report_holder])
    story.hides = story_children.filter((e) => !ignore.has(e))
    const report_displays = story.report_element.querySelectorAll("div[class]:not([class=''])")
    const report_divs = this.findFirstDivsWithNonEmptyClass(report_displays)
    report_divs.forEach((e) => {
      // if (e.contains(report)) return;
      story.hides.push(e)
    })
    this.addClasses(story.parent, [`${MBFC}-story-block`])
    if (isDevMode()) {
      log(`${MBFC}-story-block for ${story.count}`, story, story.parent)
    }
    return ok(story)
  }
}
