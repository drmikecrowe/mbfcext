/**
 * Tests for findArticleElements logic using real HTML samples.
 *
 * This tests the core algorithm independently from the Facebook class
 * to avoid Plasmo-specific import issues in test environment.
 *
 * HTML files are in .planning/.tmp/ and are NOT committed to git.
 */
import { describe, it, expect } from "vitest"
import { JSDOM } from "jsdom"
import { readFileSync, existsSync } from "fs"
import { resolve } from "path"

const TMP_DIR = resolve(__dirname, "../../../../.planning/.tmp")
const C_PROCESSED = "mbfc-processed"

/**
 * Find post containers using the data-ad-rendering-role approach.
 * This mirrors the logic in Facebook.findArticleElements()
 *
 * Algorithm:
 * 1. Find all [data-ad-rendering-role="like_button"] elements not already processed
 * 2. For each: walk up DOM to find nearest ancestor that also contains [data-ad-rendering-role="profile_name"]
 * 3. That ancestor IS the post container
 * 4. Deduplicate containers (Set)
 * 5. FALLBACK: If nothing found, use role="article" elements
 */
function findArticleElements(e: Element | null): Element[] {
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

interface HtmlSample {
  file: string
  description: string
  expectedArticles: number // Empirically determined
  expectedLikeButtons: number
  expectedProfileNames: number
}

const htmlSamples: HtmlSample[] = [
  // Expected values determined empirically from actual Facebook HTML captures
  { file: "foxnews.html", description: "Fox News search (right bias)", expectedArticles: 11, expectedLikeButtons: 38, expectedProfileNames: 38 },
  { file: "msnow.html", description: "MS Now search (left bias)", expectedArticles: 9, expectedLikeButtons: 49, expectedProfileNames: 52 },
  { file: "reuters.html", description: "Reuters search (center bias)", expectedArticles: 31, expectedLikeButtons: 31, expectedProfileNames: 34 },
  { file: "search1.html", description: "General search results", expectedArticles: 17, expectedLikeButtons: 17, expectedProfileNames: 18 },
  { file: "search2.html", description: "Another general search", expectedArticles: 18, expectedLikeButtons: 18, expectedProfileNames: 18 },
]

function loadHtml(file: string): { document: Document } | null {
  const path = resolve(TMP_DIR, file)
  if (!existsSync(path)) {
    return null
  }
  const html = readFileSync(path, "utf-8")
  const dom = new JSDOM(html, { url: "https://facebook.com" })
  return { document: dom.window.document }
}

function countDataAttributes(document: Document, attr: string): number {
  return document.querySelectorAll(`[data-ad-rendering-role="${attr}"]`).length
}

describe("findArticleElements", () => {
  describe("with HTML sample files", () => {
    htmlSamples.forEach(({ file, description, expectedArticles, expectedLikeButtons, expectedProfileNames }) => {
      it(`finds articles in ${description} (${file})`, () => {
        const loaded = loadHtml(file)
        if (!loaded) {
          console.log(`Skipping ${file} - file not found at ${resolve(TMP_DIR, file)}`)
          return
        }

        const { document } = loaded

        // Get the main element (role='main' selector) like Facebook class does
        let searchRoot = document.querySelector("div[role='main']")
        if (!searchRoot) {
          // Fall back to document body if no main element
          searchRoot = document.body
        }

        const articles = findArticleElements(searchRoot)

        const likeButtons = countDataAttributes(document, "like_button")
        const profileNames = countDataAttributes(document, "profile_name")
        const roleArticles = document.querySelectorAll('div[role="article"]').length

        console.log(`\n${file}:`)
        console.log(`  like_button count: ${likeButtons}`)
        console.log(`  profile_name count: ${profileNames}`)
        console.log(`  role="article" count: ${roleArticles}`)
        console.log(`  articles found: ${articles.length}`)

        // Verify expected counts match empirical data
        expect(articles.length).toBe(expectedArticles)
        expect(likeButtons).toBe(expectedLikeButtons)
        expect(profileNames).toBe(expectedProfileNames)

        // Verify all found articles have expected structure
        articles.forEach((article, idx) => {
          const hasLikeButton = article.querySelector('[data-ad-rendering-role="like_button"]')
          const hasProfileName = article.querySelector('[data-ad-rendering-role="profile_name"]')
          expect(hasLikeButton, `Article ${idx} should have like_button`).toBeTruthy()
          expect(hasProfileName, `Article ${idx} should have profile_name`).toBeTruthy()
        })
      })
    })
  })

  describe("edge cases", () => {
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

      // Fallback should find this because like_button doesn't have profile_name as ANCESTOR
      // (they're siblings inside the article)
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
  })
})
