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

  /**
   * Find post containers using the new data-ad-rendering-role approach.
   *
   * Algorithm:
   * 1. Find all [data-ad-rendering-role="like_button"] elements not already processed
   * 2. For each: walk up DOM to find nearest ancestor that also contains [data-ad-rendering-role="profile_name"]
   * 3. That ancestor IS the post container
   * 4. Deduplicate containers (Set)
   */
  findArticleElements(e: HTMLElement): Element[] {
    if (!e || !e.querySelectorAll) return []
    const containers = new Set<Element>()
    const likeButtons = e.querySelectorAll(`[data-ad-rendering-role="like_button"]:not(.${C_PROCESSED})`)

    likeButtons.forEach((likeBtn) => {
      // Walk up DOM to find ancestor containing both like_button and profile_name
      let ancestor: Element | null = likeBtn.parentElement
      while (ancestor && ancestor !== e) {
        const profileName = ancestor.querySelector(`[data-ad-rendering-role="profile_name"]`)
        if (profileName) {
          // Found the post container - add it if not already processed
          if (!ancestor.classList.contains(C_PROCESSED)) {
            containers.add(ancestor)
          }
          break
        }
        ancestor = ancestor.parentElement
      }
    })

    return Array.from(containers)
  }

  findTitleElement(e: HTMLElement): HTMLAnchorElement | undefined {
    // Use profile_name role to find the posting page/person link
    const profileLink = e.querySelector(`[data-ad-rendering-role="profile_name"] a`) as HTMLAnchorElement
    if (profileLink) return profileLink
    // Fallback to first link
    return e.querySelector(`a[role='link']`)
  }

  findLikeButtons(e: HTMLElement): HTMLElement | undefined {
    // Use the new like_button role
    return e.querySelector(`[data-ad-rendering-role="like_button"]`) as HTMLElement | undefined
  }

  findSponsored(e: HTMLElement): HTMLElement | undefined {
    return e.querySelector('span > span > a[aria-label="Sponsored"]')
  }

  /**
   * Extract domain from [data-ad-rendering-role="meta"].textContent
   * This is the primary domain source - Facebook shows the article domain directly.
   */
  findDomainSpan(e: HTMLElement): DomainSort | undefined {
    const metaElement = e.querySelector(`[data-ad-rendering-role="meta"]`)
    if (!metaElement) return undefined

    const text = metaElement.textContent?.trim().toLowerCase()
    if (!text) return undefined

    // The meta role contains the domain directly (e.g., "reuters.com")
    const domain = text.split(" ")[0]
    if (!domain_re.test(domain)) return undefined

    return {
      domain,
      count: 1,
      html: metaElement as HTMLElement,
    }
  }

  /**
   * Find Facebook page path from profile_name role
   */
  findPossibleFbPage(e: HTMLElement): string | undefined {
    const elem = e.querySelector(`[data-ad-rendering-role="profile_name"] a[href*='facebook.com']`) as HTMLAnchorElement
    if (elem) {
      return this.clean_path(elem)
    }
    // Fallback to old selector
    const fallback = e.querySelector("h3 span > a[href*='https://www.facebook.com']") as HTMLAnchorElement
    if (fallback) {
      return this.clean_path(fallback)
    }
  }

  findPossibleName(e: HTMLElement): string | undefined {
    // Use profile_name role text content
    const profileElement = e.querySelector(`[data-ad-rendering-role="profile_name"]`)
    if (profileElement) {
      // Get text from the profile link or direct text content
      const link = profileElement.querySelector("a")
      return (link?.textContent || profileElement.textContent)?.trim()
    }
    // Fallback
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
