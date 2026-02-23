/* eslint-disable no-param-reassign */
import { Result, err, ok } from "neverthrow"

import { sendToBackground } from "@plasmohq/messaging"

import { GET_DOMAIN_FOR_FILTER, type GetDomainForFilterRequestBody, type GetDomainForFilterResponseBody } from "~background/messages"
import { CollapseKeys, ConfigHandler } from "~shared"
import { isDevMode, logger } from "~shared/logger"

import { C_FOUND, C_PROCESSED, Filter, MBFC, type Story } from "./filter"
import { GoogleAnalytics } from "~shared/google-analytics"

isDevMode()
const log = logger("mbfc:facebook")

interface DomainSort {
  domain: string
  count: number
  html: HTMLElement
}

const domain_re = /(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]/g

// FactualSearch favicon (base64 encoded 16x16 PNG)
const FNS_FAVICON = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABmJLR0QA/wD/AP+gvaeTAAACFUlEQVQ4jaWRT0hUURSHf/e9e9/43jAj40wDGaRSO0lhrIjaiLQwYjCSgYwxoYXRKkaCFrlw7bZFEEibiaxhGpmhMaI/s2kRFa0iMaMkaKHvTaJT+N68c2+Lkhw1CPstzz3fxz3nAP8ZtmN1Qmk9n5Y6AlKYxrr/uZKL1/5NkFJ6l2VnBCEjJFqFZOASriA1wxW/Vn4QWdwq0Bpg084LQoaTGhd1P643rZlCsj4uERbkvx5MOp1//UHXyPJVQchovnbs1XT0S2ObYmeTzpQhcZSsaHcux2jjhW/MLBbsDCc1/nIL3H/uW7ux7tzR3foZDjEfXLX7ATxsGOHI/FK7kGg10VRKpJcO9ox+tQAgmVrpCH6n52EX2dzs3mVDoqJJdmL7DhQ3hWRAwKmZxIYj1cCjgYHqIeuH/yzsYjI7G7sJALrEmpDM2iYI+rTIJVyjFk68uBubaPYwF/Lk22YXk7cf/4IBwJCshxOb2yao5OI1QWqGkxwHgHyx5VLI0xK3nvyBL/c5KZ3QxvR6YccrJFPV/ZpHb3TJSj5TV4rFPWub4Y8tyHKi6XIhPrKjAAAGk06nkOoel9hnSFR0hVWD2GGd0LYQobxtsaFQnV18ej+WbVzi7+RL0XdkRbsFqWFd4r0gtqITu8F0/0C5EB8Jedpw0MPU+VP2Bew2Q6ft9OhJxxvrraZ3LRnrraavH69+2LVgc34C7gDZ7M4ZCkwAAAAASUVORK5CYII="
const FNS_SEARCH_CLASS = `${MBFC}-fns-search`

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
   * 5. FALLBACK: If nothing found, use role="article" elements
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

    // Fallback: Use role="article" elements when primary method finds nothing
    // This handles search pages and other non-feed layouts
    if (containers.size === 0) {
      const articles = e.querySelectorAll(`div[role="article"]:not(.${C_PROCESSED})`)
      articles.forEach((article) => {
        // Only include articles that have both like_button and profile_name
        const hasLikeButton = article.querySelector(`[data-ad-rendering-role="like_button"]`)
        const hasProfileName = article.querySelector(`[data-ad-rendering-role="profile_name"]`)
        if (hasLikeButton && hasProfileName) {
          containers.add(article)
        }
      })
    }

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

  /**
   * Find "See more" button and get the post text from its parent div.
   * Returns the text content and the "See more" button element.
   */
  findSeeMoreButton(e: HTMLElement): { text: string; button: HTMLElement } | undefined {
    // Find "See more" button - role="button" containing "See more" text
    const buttons = e.querySelectorAll('[role="button"]')
    for (const btn of buttons) {
      if (btn.textContent?.trim() === "See more") {
        // Get the parent div that contains the text
        const parent = btn.parentElement
        if (parent) {
          // Clone to extract text without the button text
          const clone = parent.cloneNode(true) as HTMLElement
          const btnClone = clone.querySelector('[role="button"]')
          if (btnClone) btnClone.remove()
          const text = clone.textContent?.trim()
          if (text && text.length > 10) {
            return { text, button: btn as HTMLElement }
          }
        }
      }
    }
    return undefined
  }

  /**
   * Add a discrete "News Search" button near the "See more" button.
   * Opens factualsearch.news with the post text as the query.
   */
  addNewsSearchButton(e: HTMLElement, possible_name?: string): void {
    // Skip if already processed
    if (e.querySelector(`.${FNS_SEARCH_CLASS}`)) return

    const seeMore = this.findSeeMoreButton(e)
    if (!seeMore) return

    const { text, button } = seeMore

    // Create the News Search button
    const searchBtn = document.createElement("div")
    searchBtn.className = FNS_SEARCH_CLASS
    searchBtn.style.cssText = `
      display: inline-flex;
      align-items: center;
      gap: 4px;
      margin-left: 8px;
      padding: 2px 6px;
      font-size: 11px;
      color: #333;
      cursor: pointer;
      border-radius: 4px;
      background: linear-gradient(to right, rgba(0, 0, 255, 0.15), rgba(255, 255, 255, 0.15), rgba(255, 0, 0, 0.15));
      transition: opacity 0.2s;
    `
    searchBtn.innerHTML = `
      <span>News Search</span>
      <img src="${FNS_FAVICON}" width="14" height="14" style="vertical-align: middle;">
    `

    // Add hover effect
    searchBtn.addEventListener("mouseenter", () => {
      searchBtn.style.opacity = "0.8"
    })
    searchBtn.addEventListener("mouseleave", () => {
      searchBtn.style.opacity = "1"
    })

    // Capture possible_name for analytics closure
    const pageName = possible_name

    // Open search on click
    searchBtn.addEventListener("click", (ev) => {
      ev.stopPropagation()
      // Track news search click
      GoogleAnalytics.getInstance().reportNewsSearch(undefined, pageName)
      const query = encodeURIComponent(text.substring(0, 200)) // Limit query length
      const url = `https://factualsearch.news/#gsc.tab=0&gsc.q=${query}&gsc.sort=`
      window.open(url, "_blank")
    })

    // Insert after the "See more" button
    button.parentElement?.insertBefore(searchBtn, button.nextSibling)
    log(`Added News Search button for story`)
  }

  async buildStory(parent: HTMLElement): Promise<Result<Story, string>> {
    if (parent.classList.contains(`${MBFC}-story-searched`)) return err(null)

    const possible_page = this.findPossibleFbPage(parent)
    const possible_name = this.findPossibleName(parent)

    // Add News Search button for any post (independent of MBFC lookup), unless disabled
    if (!ConfigHandler.getInstance().config.disableNewsSearchButton) {
      this.addNewsSearchButton(parent, possible_name)
    }

    const story: Story = {
      title_element: this.findTitleElement(parent),
      report_element: this.findLikeButtons(parent),
      parent,
      hides: [],
      count: this.count,
      ignored: false,
      sponsored: false,
      possible_page,
      possible_name,
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
      let matchMethod: string | undefined

      log(`Sending ${GET_DOMAIN_FOR_FILTER} request 1`, payload)
      let res = await sendToBackground<GetDomainForFilterRequestBody, GetDomainForFilterResponseBody>({
        name: GET_DOMAIN_FOR_FILTER,
        body: payload,
      })
      if (res?.site) {
        // Domain found via meta element or URL path
        matchMethod = story.possible_domain ? "meta-domain" : "url-path"
      }

      if ((!res || !res.site) && story.possible_page) {
        payload.fb_path = story.possible_page
        log(`Sending ${GET_DOMAIN_FOR_FILTER} request 2`, payload)
        res = await sendToBackground<GetDomainForFilterRequestBody, GetDomainForFilterResponseBody>({
          name: GET_DOMAIN_FOR_FILTER,
          body: payload,
        })
        if (res?.site) {
          // Domain found via known Facebook page mapping
          matchMethod = res.domain.suggested_fbtwpath ? "fb-page-new" : "fb-page-known"
        }
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
        if (res?.site) {
          // Domain found via page name matching
          matchMethod = "name-match"
          if (story.possible_page) {
            res.domain.suggested_fbtwpath = story.possible_page
          }
        }
      }

      if (!res || !res.site) {
        log(`${MBFC}-no-domain for ${story.count}`, story)
        this.addClasses(parent, [MBFC, `${MBFC}-no-domain`])
        // Track failed lookup - we have a domain from meta but it's not in our database
        if (story.possible_domain || story.possible_page) {
          GoogleAnalytics.getInstance().reportFailedLookup(
            story.possible_domain || "none",
            story.possible_page,
            story.possible_name
          )
        }
        return err(`${MBFC}-no-domain`)
      }

      story.domain = res.domain

      // Track successful match method
      if (matchMethod) {
        GoogleAnalytics.getInstance().reportMatchMethod(
          res.domain.final_domain,
          matchMethod,
          story.possible_page
        )
      }

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
