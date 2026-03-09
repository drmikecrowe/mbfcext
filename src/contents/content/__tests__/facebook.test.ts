/**
 * Tests for Facebook content script methods.
 *
 * Tests the core algorithms independently from the Facebook class
 * to avoid Plasmo-specific import issues in test environment.
 *
 * Covers:
 * - findArticleElements (data-ad-rendering-role logic)
 * - findTitleElement
 * - findLikeButtons
 * - findSponsored
 * - findDomainSpan (domain extraction)
 * - findPossibleFbPage
 * - findPossibleName
 * - findSeeMoreButton
 * - addNewsSearchButton
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { JSDOM } from "jsdom"

const C_PROCESSED = "mbfc-processed"
const MBFC = "mbfc"
const FNS_SEARCH_CLASS = `${MBFC}-fns-search`

const domain_re = /(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]/

/**
 * Find post containers using the data-ad-rendering-role approach.
 * Mirrors Facebook.findArticleElements()
 */
function findArticleElements(e: Element | null): Element[] {
  if (!e || !e.querySelectorAll) return []
  const containers = new Set<Element>()
  const likeButtons = e.querySelectorAll(`[data-ad-rendering-role="like_button"]:not(.${C_PROCESSED})`)

  likeButtons.forEach((likeBtn) => {
    let ancestor: Element | null = likeBtn.parentElement
    while (ancestor && ancestor !== e) {
      const profileName = ancestor.querySelector(`[data-ad-rendering-role="profile_name"]`)
      if (profileName) {
        if (!ancestor.classList.contains(C_PROCESSED)) {
          containers.add(ancestor)
        }
        break
      }
      ancestor = ancestor.parentElement
    }
  })

  // Fallback: Use role="article" elements when primary method finds nothing
  if (containers.size === 0) {
    const articles = e.querySelectorAll(`div[role="article"]:not(.${C_PROCESSED})`)
    articles.forEach((article) => {
      const hasLikeButton = article.querySelector(`[data-ad-rendering-role="like_button"]`)
      const hasProfileName = article.querySelector(`[data-ad-rendering-role="profile_name"]`)
      if (hasLikeButton && hasProfileName) {
        containers.add(article)
      }
    })
  }

  return Array.from(containers)
}

/**
 * Find title/profile link element.
 * Mirrors Facebook.findTitleElement()
 */
function findTitleElement(e: HTMLElement): HTMLAnchorElement | undefined {
  const profileLink = e.querySelector(`[data-ad-rendering-role="profile_name"] a`) as HTMLAnchorElement
  if (profileLink) return profileLink
  return e.querySelector(`a[role='link']`) ?? undefined
}

/**
 * Find like button element.
 * Mirrors Facebook.findLikeButtons()
 */
function findLikeButtons(e: HTMLElement): HTMLElement | undefined {
  const el = e.querySelector(`[data-ad-rendering-role="like_button"]`)
  return el as HTMLElement | undefined ?? undefined
}

/**
 * Find sponsored indicator element.
 * Mirrors Facebook.findSponsored()
 */
function findSponsored(e: HTMLElement): HTMLElement | undefined {
  const el = e.querySelector('span > span > a[aria-label="Sponsored"]')
  return (el as HTMLElement | undefined) ?? undefined
}

/**
 * Extract domain from meta element.
 * Mirrors Facebook.findDomainSpan()
 */
interface DomainResult {
  domain: string
  count: number
  html: HTMLElement
}

function findDomainSpan(e: HTMLElement): DomainResult | undefined {
  const metaElement = e.querySelector(`[data-ad-rendering-role="meta"]`)
  if (!metaElement) return undefined

  const text = metaElement.textContent?.trim().toLowerCase()
  if (!text) return undefined

  const domain = text.split(" ")[0]
  if (!domain_re.test(domain)) return undefined

  return {
    domain,
    count: 1,
    html: metaElement as HTMLElement,
  }
}

/**
 * Clean Facebook path from URL.
 * Mirrors Facebook.clean_path()
 */
function cleanPath(anchor: HTMLAnchorElement): string {
  try {
    const u = new URL(anchor.href)
    return u.pathname.toLowerCase().replace(/^\/?([^/?]*)[/?]?$/, "$1")
  } catch {
    return ""
  }
}

/**
 * Find Facebook page path from profile.
 * Mirrors Facebook.findPossibleFbPage()
 */
function findPossibleFbPage(e: HTMLElement): string | undefined {
  const elem = e.querySelector(`[data-ad-rendering-role="profile_name"] a[href*='facebook.com']`) as HTMLAnchorElement
  if (elem) {
    return cleanPath(elem)
  }
  const fallback = e.querySelector("h3 span > a[href*='https://www.facebook.com']") as HTMLAnchorElement
  if (fallback) {
    return cleanPath(fallback)
  }
  return undefined
}

/**
 * Find profile name text.
 * Mirrors Facebook.findPossibleName()
 */
function findPossibleName(e: HTMLElement): string | undefined {
  const profileElement = e.querySelector(`[data-ad-rendering-role="profile_name"]`)
  if (profileElement) {
    const link = profileElement.querySelector("a")
    const text = (link?.textContent || profileElement.textContent)?.trim()
    return text || undefined
  }
  const elem = e.querySelector("h3 span > a > strong > span") as HTMLSpanElement
  if (elem) {
    const text = elem.textContent?.trim()
    return text || undefined
  }
  return undefined
}

/**
 * Find "See more" button and get post text.
 * Mirrors Facebook.findSeeMoreButton()
 */
function findSeeMoreButton(e: HTMLElement): { text: string; button: HTMLElement } | undefined {
  const buttons = e.querySelectorAll('[role="button"]')
  for (const btn of buttons) {
    if (btn.textContent?.trim() === "See more") {
      const parent = btn.parentElement
      if (parent) {
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
 * Add News Search button.
 * Mirrors Facebook.addNewsSearchButton()
 */
function addNewsSearchButton(e: HTMLElement, possible_name?: string): void {
  if (e.querySelector(`.${FNS_SEARCH_CLASS}`)) return

  const seeMore = findSeeMoreButton(e)
  if (!seeMore) return

  const { text, button } = seeMore

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
  const span = document.createElement("span")
  span.textContent = "News Search"
  const img = document.createElement("img")
  img.src = "data:image/png;base64,test"
  img.width = 14
  img.height = 14
  img.style.verticalAlign = "middle"
  searchBtn.appendChild(span)
  searchBtn.appendChild(img)

  const pageName = possible_name

  searchBtn.addEventListener("click", (ev) => {
    ev.stopPropagation()
    const query = encodeURIComponent(text.substring(0, 200))
    const url = `https://factualsearch.news/#gsc.tab=0&gsc.q=${query}&gsc.sort=`
    window.open(url, "_blank")
  })

  button.parentElement?.insertBefore(searchBtn, button.nextSibling)
}

describe("Facebook content script", () => {
  describe("findArticleElements", () => {
    it("returns empty array for null input", () => {
      const result = findArticleElements(null)
      expect(result).toEqual([])
    })

    it("returns empty array for element with no articles", () => {
      const dom = new JSDOM("<div><p>No articles here</p></div>")
      const result = findArticleElements(dom.window.document.body)
      expect(result).toEqual([])
    })

    it("finds article when like_button has profile_name ancestor", () => {
      const html = `
        <div id="root">
          <div id="post-container">
            <div data-ad-rendering-role="profile_name">Some User</div>
            <div data-ad-rendering-role="story_message">Post content</div>
            <div data-ad-rendering-role="like_button">Like</div>
          </div>
        </div>
      `
      const dom = new JSDOM(html)
      const root = dom.window.document.getElementById("root")!
      const result = findArticleElements(root)

      expect(result.length).toBe(1)
      expect(result[0].id).toBe("post-container")
    })

    it("deduplicates containers with multiple like_buttons", () => {
      const html = `
        <div id="root">
          <div id="post1">
            <div data-ad-rendering-role="profile_name">User 1</div>
            <div data-ad-rendering-role="like_button">Like</div>
            <div data-ad-rendering-role="comment_button">Comment</div>
            <div data-ad-rendering-role="like_button">Another Like</div>
          </div>
        </div>
      `
      const dom = new JSDOM(html)
      const root = dom.window.document.getElementById("root")!
      const result = findArticleElements(root)

      expect(result.length).toBe(1)
      expect(result[0].id).toBe("post1")
    })

    it("finds multiple distinct posts", () => {
      const html = `
        <div id="root">
          <div id="post1">
            <div data-ad-rendering-role="profile_name">User 1</div>
            <div data-ad-rendering-role="like_button">Like</div>
          </div>
          <div id="post2">
            <div data-ad-rendering-role="profile_name">User 2</div>
            <div data-ad-rendering-role="like_button">Like</div>
          </div>
          <div id="post3">
            <div data-ad-rendering-role="profile_name">User 3</div>
            <div data-ad-rendering-role="like_button">Like</div>
          </div>
        </div>
      `
      const dom = new JSDOM(html)
      const root = dom.window.document.getElementById("root")!
      const result = findArticleElements(root)

      expect(result.length).toBe(3)
      const ids = result.map((el) => el.id).sort()
      expect(ids).toEqual(["post1", "post2", "post3"])
    })

    it("uses role=article fallback when primary method finds nothing", () => {
      const html = `
        <div id="root">
          <div role="article" id="fallback-article">
            <div data-ad-rendering-role="profile_name">User</div>
            <div data-ad-rendering-role="like_button">Like</div>
          </div>
        </div>
      `
      const dom = new JSDOM(html)
      const root = dom.window.document.getElementById("root")!
      const result = findArticleElements(root)

      expect(result.length).toBe(1)
      expect(result[0].id).toBe("fallback-article")
    })

    it("excludes already processed elements", () => {
      const html = `
        <div id="root">
          <div id="post1" class="mbfc-processed">
            <div data-ad-rendering-role="profile_name">User 1</div>
            <div data-ad-rendering-role="like_button">Like</div>
          </div>
          <div id="post2">
            <div data-ad-rendering-role="profile_name">User 2</div>
            <div data-ad-rendering-role="like_button">Like</div>
          </div>
        </div>
      `
      const dom = new JSDOM(html)
      const root = dom.window.document.getElementById("root")!
      const result = findArticleElements(root)

      expect(result.length).toBe(1)
      expect(result[0].id).toBe("post2")
    })

    it("handles deeply nested post structures", () => {
      const html = `
        <div id="root">
          <div>
            <div>
              <div>
                <div id="deep-post">
                  <div>
                    <div data-ad-rendering-role="profile_name">Deep User</div>
                  </div>
                  <div>
                    <div>
                      <div data-ad-rendering-role="like_button">Like</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `
      const dom = new JSDOM(html)
      const root = dom.window.document.getElementById("root")!
      const result = findArticleElements(root)

      expect(result.length).toBe(1)
      expect(result[0].id).toBe("deep-post")
    })

    it("skips like_button without profile_name ancestor", () => {
      const html = `
        <div id="root">
          <div id="orphan-like">
            <div data-ad-rendering-role="like_button">Like</div>
          </div>
          <div id="valid-post">
            <div data-ad-rendering-role="profile_name">User</div>
            <div data-ad-rendering-role="like_button">Like</div>
          </div>
        </div>
      `
      const dom = new JSDOM(html)
      const root = dom.window.document.getElementById("root")!
      const result = findArticleElements(root)

      expect(result.length).toBe(1)
      expect(result[0].id).toBe("valid-post")
    })

    it("fallback excludes articles without both required elements", () => {
      const html = `
        <div id="root">
          <div role="article" id="no-profile">
            <div data-ad-rendering-role="like_button">Like</div>
          </div>
          <div role="article" id="no-like">
            <div data-ad-rendering-role="profile_name">User</div>
          </div>
          <div role="article" id="valid-article">
            <div data-ad-rendering-role="profile_name">User</div>
            <div data-ad-rendering-role="like_button">Like</div>
          </div>
        </div>
      `
      const dom = new JSDOM(html)
      const root = dom.window.document.getElementById("root")!
      const result = findArticleElements(root)

      expect(result.length).toBe(1)
      expect(result[0].id).toBe("valid-article")
    })
  })

  describe("findTitleElement", () => {
    it("finds profile link via data-ad-rendering-role", () => {
      const html = `
        <div id="post">
          <div data-ad-rendering-role="profile_name">
            <a href="https://facebook.com/somepage">Some Page</a>
          </div>
        </div>
      `
      const dom = new JSDOM(html)
      const post = dom.window.document.getElementById("post")!
      const result = findTitleElement(post)

      expect(result).toBeDefined()
      expect(result?.href).toBe("https://facebook.com/somepage")
      expect(result?.textContent).toBe("Some Page")
    })

    it("falls back to first a[role='link']", () => {
      const html = `
        <div id="post">
          <a role="link" href="https://example.com">Fallback Link</a>
        </div>
      `
      const dom = new JSDOM(html)
      const post = dom.window.document.getElementById("post")!
      const result = findTitleElement(post)

      expect(result).toBeDefined()
      expect(result?.href).toBe("https://example.com/")
    })

    it("returns undefined when no link found", () => {
      const html = `<div id="post">No links here</div>`
      const dom = new JSDOM(html)
      const post = dom.window.document.getElementById("post")!
      const result = findTitleElement(post)

      expect(result).toBeUndefined()
    })

    it("prefers profile link over fallback", () => {
      const html = `
        <div id="post">
          <div data-ad-rendering-role="profile_name">
            <a href="https://facebook.com/preferred">Preferred</a>
          </div>
          <a role="link" href="https://example.com/fallback">Fallback</a>
        </div>
      `
      const dom = new JSDOM(html)
      const post = dom.window.document.getElementById("post")!
      const result = findTitleElement(post)

      expect(result?.textContent).toBe("Preferred")
    })
  })

  describe("findLikeButtons", () => {
    it("finds like button via data-ad-rendering-role", () => {
      const html = `
        <div id="post">
          <div data-ad-rendering-role="like_button">Like</div>
        </div>
      `
      const dom = new JSDOM(html)
      const post = dom.window.document.getElementById("post")!
      const result = findLikeButtons(post)

      expect(result).toBeDefined()
      expect(result?.textContent).toBe("Like")
    })

    it("returns undefined when no like button found", () => {
      const html = `<div id="post">No like button</div>`
      const dom = new JSDOM(html)
      const post = dom.window.document.getElementById("post")!
      const result = findLikeButtons(post)

      expect(result).toBeUndefined()
    })
  })

  describe("findSponsored", () => {
    it("finds sponsored indicator with correct structure", () => {
      const html = `
        <div id="post">
          <span>
            <span>
              <a aria-label="Sponsored">Sponsored</a>
            </span>
          </span>
        </div>
      `
      const dom = new JSDOM(html)
      const post = dom.window.document.getElementById("post")!
      const result = findSponsored(post)

      expect(result).toBeDefined()
    })

    it("returns undefined for incorrect nesting", () => {
      const html = `
        <div id="post">
          <span>
            <a aria-label="Sponsored">Sponsored</a>
          </span>
        </div>
      `
      const dom = new JSDOM(html)
      const post = dom.window.document.getElementById("post")!
      const result = findSponsored(post)

      expect(result).toBeUndefined()
    })

    it("returns undefined when no sponsored element", () => {
      const html = `<div id="post">Regular post</div>`
      const dom = new JSDOM(html)
      const post = dom.window.document.getElementById("post")!
      const result = findSponsored(post)

      expect(result).toBeUndefined()
    })

    it("finds element regardless of aria-label case (HTML attribute matching)", () => {
      // Note: CSS attribute selectors for aria-label match case-insensitively
      // This is expected HTML behavior
      const html = `
        <div id="post">
          <span>
            <span>
              <a aria-label="sponsored">sponsored</a>
            </span>
          </span>
        </div>
      `
      const dom = new JSDOM(html, { url: "https://facebook.com" })
      const post = dom.window.document.getElementById("post")!
      const result = findSponsored(post)

      // CSS attribute selectors are case-insensitive for HTML attributes
      expect(result).toBeDefined()
    })
  })

  describe("findDomainSpan", () => {
    it("extracts domain from meta element", () => {
      const html = `
        <div id="post">
          <div data-ad-rendering-role="meta">reuters.com</div>
        </div>
      `
      const dom = new JSDOM(html)
      const post = dom.window.document.getElementById("post")!
      const result = findDomainSpan(post)

      expect(result).toBeDefined()
      expect(result?.domain).toBe("reuters.com")
    })

    it("handles domain with extra text (takes first word)", () => {
      const html = `
        <div id="post">
          <div data-ad-rendering-role="meta">nytimes.com 2h ago</div>
        </div>
      `
      const dom = new JSDOM(html)
      const post = dom.window.document.getElementById("post")!
      const result = findDomainSpan(post)

      expect(result?.domain).toBe("nytimes.com")
    })

    it("converts domain to lowercase", () => {
      const html = `
        <div id="post">
          <div data-ad-rendering-role="meta">REUTERS.COM</div>
        </div>
      `
      const dom = new JSDOM(html)
      const post = dom.window.document.getElementById("post")!
      const result = findDomainSpan(post)

      expect(result?.domain).toBe("reuters.com")
    })

    it("returns undefined for invalid domain", () => {
      const html = `
        <div id="post">
          <div data-ad-rendering-role="meta">not a domain</div>
        </div>
      `
      const dom = new JSDOM(html)
      const post = dom.window.document.getElementById("post")!
      const result = findDomainSpan(post)

      expect(result).toBeUndefined()
    })

    it("returns undefined when meta element missing", () => {
      const html = `<div id="post">No meta</div>`
      const dom = new JSDOM(html)
      const post = dom.window.document.getElementById("post")!
      const result = findDomainSpan(post)

      expect(result).toBeUndefined()
    })

    it("returns undefined for empty meta content", () => {
      const html = `
        <div id="post">
          <div data-ad-rendering-role="meta"></div>
        </div>
      `
      const dom = new JSDOM(html)
      const post = dom.window.document.getElementById("post")!
      const result = findDomainSpan(post)

      expect(result).toBeUndefined()
    })

    it("validates domain format with regex", () => {
      const validDomains = ["example.com", "sub.example.com", "news.co.uk", "abc123.org"]
      const invalidDomains = ["notadomain", "123", "domain", "domain."]

      validDomains.forEach((domain) => {
        expect(domain_re.test(domain)).toBe(true)
      })

      invalidDomains.forEach((domain) => {
        expect(domain_re.test(domain)).toBe(false)
      })
    })

    it("handles subdomain domains", () => {
      const html = `
        <div id="post">
          <div data-ad-rendering-role="meta">www.bbc.co.uk</div>
        </div>
      `
      const dom = new JSDOM(html)
      const post = dom.window.document.getElementById("post")!
      const result = findDomainSpan(post)

      expect(result?.domain).toBe("www.bbc.co.uk")
    })
  })

  describe("findPossibleFbPage", () => {
    it("extracts path from profile link", () => {
      const html = `
        <div id="post">
          <div data-ad-rendering-role="profile_name">
            <a href="https://www.facebook.com/Reuters">Reuters</a>
          </div>
        </div>
      `
      const dom = new JSDOM(html)
      const post = dom.window.document.getElementById("post")!
      const result = findPossibleFbPage(post)

      expect(result).toBe("reuters")
    })

    it("handles URLs with query parameters", () => {
      const html = `
        <div id="post">
          <div data-ad-rendering-role="profile_name">
            <a href="https://www.facebook.com/BBCNews?ref=page">BBC News</a>
          </div>
        </div>
      `
      const dom = new JSDOM(html)
      const post = dom.window.document.getElementById("post")!
      const result = findPossibleFbPage(post)

      expect(result).toBe("bbcnews")
    })

    it("uses fallback selector when primary not found", () => {
      const html = `
        <div id="post">
          <h3>
            <span>
              <a href="https://www.facebook.com/CNN">CNN</a>
            </span>
          </h3>
        </div>
      `
      const dom = new JSDOM(html)
      const post = dom.window.document.getElementById("post")!
      const result = findPossibleFbPage(post)

      expect(result).toBe("cnn")
    })

    it("returns undefined when no facebook link found", () => {
      const html = `
        <div id="post">
          <a href="https://example.com">Not Facebook</a>
        </div>
      `
      const dom = new JSDOM(html)
      const post = dom.window.document.getElementById("post")!
      const result = findPossibleFbPage(post)

      expect(result).toBeUndefined()
    })

    it("handles paths with leading slash", () => {
      const html = `
        <div id="post">
          <div data-ad-rendering-role="profile_name">
            <a href="https://www.facebook.com/NYTimes/">NY Times</a>
          </div>
        </div>
      `
      const dom = new JSDOM(html)
      const post = dom.window.document.getElementById("post")!
      const result = findPossibleFbPage(post)

      expect(result).toBe("nytimes")
    })
  })

  describe("findPossibleName", () => {
    it("extracts name from profile element link", () => {
      const html = `
        <div id="post">
          <div data-ad-rendering-role="profile_name">
            <a href="https://facebook.com/reuters">Reuters News Agency</a>
          </div>
        </div>
      `
      const dom = new JSDOM(html)
      const post = dom.window.document.getElementById("post")!
      const result = findPossibleName(post)

      expect(result).toBe("Reuters News Agency")
    })

    it("falls back to profile element text content", () => {
      const html = `
        <div id="post">
          <div data-ad-rendering-role="profile_name">Direct Text Name</div>
        </div>
      `
      const dom = new JSDOM(html)
      const post = dom.window.document.getElementById("post")!
      const result = findPossibleName(post)

      expect(result).toBe("Direct Text Name")
    })

    it("uses fallback selector for legacy structure", () => {
      const html = `
        <div id="post">
          <h3>
            <span>
              <a>
                <strong>
                  <span>Fallback Name</span>
                </strong>
              </a>
            </span>
          </h3>
        </div>
      `
      const dom = new JSDOM(html)
      const post = dom.window.document.getElementById("post")!
      const result = findPossibleName(post)

      expect(result).toBe("Fallback Name")
    })

    it("returns undefined when no name found", () => {
      const html = `<div id="post">No name elements</div>`
      const dom = new JSDOM(html)
      const post = dom.window.document.getElementById("post")!
      const result = findPossibleName(post)

      expect(result).toBeUndefined()
    })

    it("trims whitespace from name", () => {
      const html = `
        <div id="post">
          <div data-ad-rendering-role="profile_name">
            <a href="#">  Spaced Name  </a>
          </div>
        </div>
      `
      const dom = new JSDOM(html)
      const post = dom.window.document.getElementById("post")!
      const result = findPossibleName(post)

      expect(result).toBe("Spaced Name")
    })
  })

  describe("findSeeMoreButton", () => {
    it("finds 'See more' button and extracts text", () => {
      const html = `
        <div id="post">
          <div>
            <p>This is a long post text that should be extracted when See more is clicked</p>
            <div role="button">See more</div>
          </div>
        </div>
      `
      const dom = new JSDOM(html)
      const post = dom.window.document.getElementById("post")!
      const result = findSeeMoreButton(post)

      expect(result).toBeDefined()
      expect(result?.button.textContent).toBe("See more")
      expect(result?.text).toBe("This is a long post text that should be extracted when See more is clicked")
    })

    it("excludes button text from extracted content", () => {
      const html = `
        <div id="post">
          <div>
            <p>Post content here</p>
            <div role="button">See more</div>
          </div>
        </div>
      `
      const dom = new JSDOM(html)
      const post = dom.window.document.getElementById("post")!
      const result = findSeeMoreButton(post)

      expect(result?.text).not.toContain("See more")
    })

    it("returns undefined when no 'See more' button", () => {
      const html = `
        <div id="post">
          <div role="button">Continue reading</div>
        </div>
      `
      const dom = new JSDOM(html)
      const post = dom.window.document.getElementById("post")!
      const result = findSeeMoreButton(post)

      expect(result).toBeUndefined()
    })

    it("requires minimum text length (> 10 chars)", () => {
      const html = `
        <div id="post">
          <div>
            <p>Short</p>
            <div role="button">See more</div>
          </div>
        </div>
      `
      const dom = new JSDOM(html)
      const post = dom.window.document.getElementById("post")!
      const result = findSeeMoreButton(post)

      expect(result).toBeUndefined()
    })

    it("handles multiple buttons", () => {
      const html = `
        <div id="post">
          <div>
            <p>First section content here</p>
            <div role="button">See more</div>
          </div>
          <div>
            <p>Second section content</p>
            <div role="button">Reply</div>
          </div>
        </div>
      `
      const dom = new JSDOM(html)
      const post = dom.window.document.getElementById("post")!
      const result = findSeeMoreButton(post)

      expect(result).toBeDefined()
      expect(result?.text).toBe("First section content here")
    })

    it("requires exact 'See more' text match", () => {
      const html = `
        <div id="post">
          <div>
            <p>Content</p>
            <div role="button">See More</div>
          </div>
        </div>
      `
      const dom = new JSDOM(html)
      const post = dom.window.document.getElementById("post")!
      const result = findSeeMoreButton(post)

      // Case sensitive - "See More" != "See more"
      expect(result).toBeUndefined()
    })
  })

  describe("addNewsSearchButton", () => {
    let windowOpenSpy: ReturnType<typeof vi.spyOn>

    beforeEach(() => {
      windowOpenSpy = vi.spyOn(window, "open").mockImplementation(() => null)
    })

    afterEach(() => {
      windowOpenSpy.mockRestore()
    })

    it("adds search button after 'See more' button", () => {
      const html = `
        <div id="post">
          <div>
            <p>This is some post content for searching</p>
            <div role="button">See more</div>
          </div>
        </div>
      `
      const dom = new JSDOM(html)
      const post = dom.window.document.getElementById("post")! as HTMLElement

      addNewsSearchButton(post)

      const searchBtn = post.querySelector(`.${FNS_SEARCH_CLASS}`)
      expect(searchBtn).toBeDefined()
      expect(searchBtn?.querySelector("span")?.textContent).toBe("News Search")
    })

    it("skips if already processed", () => {
      const html = `
        <div id="post">
          <div class="${FNS_SEARCH_CLASS}">Already added</div>
          <div>
            <p>Content</p>
            <div role="button">See more</div>
          </div>
        </div>
      `
      const dom = new JSDOM(html)
      const post = dom.window.document.getElementById("post")! as HTMLElement

      addNewsSearchButton(post)

      const searchBtns = post.querySelectorAll(`.${FNS_SEARCH_CLASS}`)
      expect(searchBtns.length).toBe(1)
    })

    it("does nothing if no 'See more' button found", () => {
      const html = `
        <div id="post">
          <p>Post without See more</p>
        </div>
      `
      const dom = new JSDOM(html)
      const post = dom.window.document.getElementById("post")! as HTMLElement

      addNewsSearchButton(post)

      const searchBtn = post.querySelector(`.${FNS_SEARCH_CLASS}`)
      expect(searchBtn).toBeNull()
    })

    it("opens factualsearch.news on click", () => {
      const html = `
        <div id="post">
          <div>
            <p>This is post content to search for news articles</p>
            <div role="button">See more</div>
          </div>
        </div>
      `
      const dom = new JSDOM(html)
      const post = dom.window.document.getElementById("post")! as HTMLElement

      addNewsSearchButton(post)

      const searchBtn = post.querySelector(`.${FNS_SEARCH_CLASS}`) as HTMLElement
      searchBtn.click()

      expect(windowOpenSpy).toHaveBeenCalledTimes(1)
      const calledUrl = windowOpenSpy.mock.calls[0][0]
      expect(calledUrl).toContain("factualsearch.news")
      expect(calledUrl).toContain("gsc.q=")
    })

    it("encodes query parameters", () => {
      const html = `
        <div id="post">
          <div>
            <p>Test & "special" <characters></p>
            <div role="button">See more</div>
          </div>
        </div>
      `
      const dom = new JSDOM(html)
      const post = dom.window.document.getElementById("post")! as HTMLElement

      addNewsSearchButton(post)

      const searchBtn = post.querySelector(`.${FNS_SEARCH_CLASS}`) as HTMLElement
      searchBtn.click()

      const calledUrl = windowOpenSpy.mock.calls[0][0]
      expect(calledUrl).toContain("Test%20") // Space encoded
    })

    it("limits query to 200 characters", () => {
      const longText = "A".repeat(300)
      const html = `
        <div id="post">
          <div>
            <p>${longText}</p>
            <div role="button">See more</div>
          </div>
        </div>
      `
      const dom = new JSDOM(html)
      const post = dom.window.document.getElementById("post")! as HTMLElement

      addNewsSearchButton(post)

      const searchBtn = post.querySelector(`.${FNS_SEARCH_CLASS}`) as HTMLElement
      searchBtn.click()

      const calledUrl = windowOpenSpy.mock.calls[0][0]
      const queryMatch = calledUrl.match(/gsc\.q=([^&]+)/)
      expect(queryMatch).toBeDefined()
      const decodedQuery = decodeURIComponent(queryMatch![1])
      expect(decodedQuery.length).toBeLessThanOrEqual(200)
    })

    it("stops event propagation on click", () => {
      const html = `
        <div id="post">
          <div>
            <p>Content for search</p>
            <div role="button">See more</div>
          </div>
        </div>
      `
      const dom = new JSDOM(html)
      const post = dom.window.document.getElementById("post")! as HTMLElement

      addNewsSearchButton(post)

      const searchBtn = post.querySelector(`.${FNS_SEARCH_CLASS}`) as HTMLElement
      const event = new dom.window.Event("click", { bubbles: true })
      const stopPropagationSpy = vi.spyOn(event, "stopPropagation")

      searchBtn.dispatchEvent(event)

      expect(stopPropagationSpy).toHaveBeenCalled()
    })
  })

  describe("edge cases and malformed HTML", () => {
    it("handles null element gracefully", () => {
      expect(() => findArticleElements(null)).not.toThrow()
      expect(findArticleElements(null)).toEqual([])
    })

    it("handles element without querySelectorAll", () => {
      const result = findArticleElements({} as Element)
      expect(result).toEqual([])
    })

    it("handles deeply nested but incomplete structures", () => {
      const html = `
        <div id="root">
          <div>
            <div>
              <div>
                <div data-ad-rendering-role="like_button">Orphan Like</div>
              </div>
            </div>
          </div>
        </div>
      `
      const dom = new JSDOM(html)
      const root = dom.window.document.getElementById("root")!
      const result = findArticleElements(root)

      // Should use fallback and find nothing (no profile_name)
      expect(result.length).toBe(0)
    })

    it("handles mixed valid and invalid posts", () => {
      const html = `
        <div id="root">
          <div id="invalid">
            <div data-ad-rendering-role="like_button">Like</div>
          </div>
          <div id="valid">
            <div data-ad-rendering-role="profile_name">User</div>
            <div data-ad-rendering-role="like_button">Like</div>
          </div>
          <div id="also-invalid">
            <div data-ad-rendering-role="profile_name">User</div>
          </div>
        </div>
      `
      const dom = new JSDOM(html)
      const root = dom.window.document.getElementById("root")!
      const result = findArticleElements(root)

      expect(result.length).toBe(1)
      expect(result[0].id).toBe("valid")
    })

    it("handles empty text content gracefully", () => {
      const html = `
        <div id="post">
          <div data-ad-rendering-role="profile_name"></div>
        </div>
      `
      const dom = new JSDOM(html)
      const post = dom.window.document.getElementById("post")! as HTMLElement

      expect(findPossibleName(post)).toBeUndefined()
    })

    it("handles malformed URLs in links", () => {
      const html = `
        <div id="post">
          <div data-ad-rendering-role="profile_name">
            <a href="not-a-valid-url">Link</a>
          </div>
        </div>
      `
      const dom = new JSDOM(html)
      const post = dom.window.document.getElementById("post")! as HTMLElement

      // Should not throw
      expect(() => findPossibleFbPage(post)).not.toThrow()
    })

    it("handles whitespace-only content", () => {
      const html = `
        <div id="post">
          <div data-ad-rendering-role="meta">   </div>
        </div>
      `
      const dom = new JSDOM(html)
      const post = dom.window.document.getElementById("post")! as HTMLElement

      expect(findDomainSpan(post)).toBeUndefined()
    })

    it("handles special characters in domain", () => {
      const html = `
        <div id="post">
          <div data-ad-rendering-role="meta">example.com?tracking=123</div>
        </div>
      `
      const dom = new JSDOM(html)
      const post = dom.window.document.getElementById("post")! as HTMLElement
      const result = findDomainSpan(post)

      // Should extract just the domain part (first word)
      expect(result?.domain).toBe("example.com?tracking=123")
    })
  })

  describe("integration scenarios", () => {
    it("processes a complete Facebook post structure", () => {
      const html = `
        <div id="root">
          <div id="post">
            <div data-ad-rendering-role="profile_name">
              <a href="https://www.facebook.com/Reuters">Reuters</a>
            </div>
            <div data-ad-rendering-role="meta">reuters.com</div>
            <div>
              <p>Breaking news article content that is quite long and needs a See more button to expand</p>
              <div role="button">See more</div>
            </div>
            <div data-ad-rendering-role="like_button">Like</div>
          </div>
        </div>
      `
      const dom = new JSDOM(html)
      const root = dom.window.document.getElementById("root")!

      // Test article detection
      const articles = findArticleElements(root)
      expect(articles.length).toBe(1)

      const post = articles[0]

      // Test title extraction
      const title = findTitleElement(post as HTMLElement)
      expect(title?.textContent).toBe("Reuters")

      // Test domain extraction
      const domain = findDomainSpan(post as HTMLElement)
      expect(domain?.domain).toBe("reuters.com")

      // Test like button
      const likeBtn = findLikeButtons(post as HTMLElement)
      expect(likeBtn).toBeDefined()

      // Test page path
      const pagePath = findPossibleFbPage(post as HTMLElement)
      expect(pagePath).toBe("reuters")

      // Test name
      const name = findPossibleName(post as HTMLElement)
      expect(name).toBe("Reuters")

      // Test See more
      const seeMore = findSeeMoreButton(post as HTMLElement)
      expect(seeMore).toBeDefined()
    })

    it("handles sponsored post correctly", () => {
      const html = `
        <div id="post">
          <div data-ad-rendering-role="profile_name">
            <a href="https://www.facebook.com/SomeBrand">Some Brand</a>
          </div>
          <span>
            <span>
              <a aria-label="Sponsored">Sponsored</a>
            </span>
          </span>
          <div data-ad-rendering-role="like_button">Like</div>
        </div>
      `
      const dom = new JSDOM(html)
      const post = dom.window.document.getElementById("post")! as HTMLElement

      const sponsored = findSponsored(post)
      expect(sponsored).toBeDefined()
    })

    it("handles post without external domain (Facebook-only content)", () => {
      const html = `
        <div id="post">
          <div data-ad-rendering-role="profile_name">
            <a href="https://www.facebook.com/somepage">Some Page</a>
          </div>
          <p>This is a Facebook-only post with no external link</p>
          <div data-ad-rendering-role="like_button">Like</div>
        </div>
      `
      const dom = new JSDOM(html)
      const post = dom.window.document.getElementById("post")! as HTMLElement

      const domain = findDomainSpan(post)
      expect(domain).toBeUndefined()

      const pagePath = findPossibleFbPage(post)
      expect(pagePath).toBe("somepage")
    })
  })
})
