/**
 * Tests for getSiteFromUrl utility function.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"

// Mock logger before any imports that use it
vi.mock("~shared/logger", () => ({
  logger: () => vi.fn(),
  isDevMode: () => false,
}))

// Mock getDomain to avoid importing the actual module
vi.mock("~shared/get-domain", () => ({
  getDomain: (url: string) => {
    if (!url) return { domain: "", path: "" }
    try {
      const urlObj = new URL(url.startsWith("http") ? url : `https://${url}`)
      let domain = urlObj.hostname.toLowerCase()
      // Strip www prefix
      domain = domain.replace(/^(www[0-9]?\.)?/, "")
      let path = urlObj.pathname.toLowerCase()
      if (path.startsWith("/")) path = path.slice(1)
      if (path.endsWith("/")) path = path.slice(0, -1)
      if (path.includes("?")) path = path.split("?")[0]
      return { domain, path }
    } catch {
      return { domain: "", path: "" }
    }
  },
}))

import { BiasEnums, ReportingEnums } from "~models/combined-manager"
import type { SiteModel } from "~models/combined-manager"
import type { SourceData } from "~background/sources-processor"
import type { ConfigStorage, Collapse } from "~shared/config-handler"

import { getSiteFromUrl } from "../get-site-from-url"

// Helper to create a minimal SiteModel for testing
function createMockSite(overrides: Partial<SiteModel> = {}): SiteModel {
  return {
    domain: "example.com",
    name: "Example News",
    bias: BiasEnums.Center,
    reporting: ReportingEnums.High,
    questionable: [],
    url: "https://mediabiasfactcheck.com/example",
    ...overrides,
  }
}

// Default collapse settings
const DefaultCollapse: Collapse = {
  collapseLeft: false,
  collapseLeftCenter: false,
  collapseCenter: false,
  collapseRightCenter: false,
  collapseRight: false,
  collapseProScience: false,
  collapseConspiracy: true,
  collapseSatire: false,
  collapseFakeNews: true,
  collapseMixed: false,
  collapseSponsored: false,
}

// Helper to create minimal SourceData for testing
function createMockSourceData(overrides: Partial<SourceData> = {}): SourceData {
  return {
    combined: {
      aliases: {},
      biases: [],
      credibility: [],
      date: "2024-01-01",
      questionable: [],
      reporting: [],
      sources: [],
      traffic: [],
      version: 1,
    },
    subdomains: {},
    fb_pages: {},
    name_pages: {},
    sites_by_domain: {},
    ...overrides,
  }
}

// Helper to create minimal ConfigStorage for testing
function createMockConfig(overrides: Partial<ConfigStorage> = {}): ConfigStorage {
  return {
    collapse: { ...DefaultCollapse },
    hiddenSites: {},
    unknown: {},
    lastRun: 0,
    firstrun: true,
    loaded: false,
    mbfcBlockAnalytics: false,
    disableNewsSearchButton: false,
    disableAnnotationBar: false,
    pollMinutes: 60,
    ...overrides,
  }
}

describe("getSiteFromUrl", () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  describe("error cases - invalid inputs", () => {
    it("should return error for null sourceData", () => {
      const config = createMockConfig()

      // @ts-expect-error - Testing null input
      const result = getSiteFromUrl("https://example.com", null, config)

      expect(result.isErr()).toBe(true)
    })

    it("should return error for undefined sourceData", () => {
      const config = createMockConfig()

      // @ts-expect-error - Testing undefined input
      const result = getSiteFromUrl("https://example.com", undefined, config)

      expect(result.isErr()).toBe(true)
    })

    it("should return error for sourceData without fb_pages", () => {
      const sourceData = {
        combined: undefined,
        subdomains: {},
        // Missing fb_pages
        name_pages: {},
        sites_by_domain: {},
      } as any
      const config = createMockConfig()

      const result = getSiteFromUrl("https://example.com", sourceData, config)

      expect(result.isErr()).toBe(true)
    })

    it("should return error for empty URL", () => {
      const sourceData = createMockSourceData()
      const config = createMockConfig()

      const result = getSiteFromUrl("", sourceData, config)

      expect(result.isErr()).toBe(true)
    })

    it("should return error for malformed URL", () => {
      const sourceData = createMockSourceData()
      const config = createMockConfig()

      const result = getSiteFromUrl("not-a-valid-url", sourceData, config)

      // Should handle gracefully - might return error or empty result
      expect(result.isErr() || (result.isOk() && result.value.site === null)).toBe(true)
    })
  })

  describe("successful domain matching", () => {
    it("should find site by URL", () => {
      const site = createMockSite({ domain: "example.com" })
      const sourceData = createMockSourceData({
        sites_by_domain: {
          "example.com": site,
        },
      })
      const config = createMockConfig()

      const result = getSiteFromUrl("https://example.com/article", sourceData, config)

      expect(result.isOk()).toBe(true)
      if (result.isOk()) {
        expect(result.value.site).toBe(site)
        expect(result.value.final_domain).toBe("example.com")
      }
    })

    it("should find site with subdomain stripped from www", () => {
      const site = createMockSite({ domain: "example.com" })
      const sourceData = createMockSourceData({
        sites_by_domain: {
          "example.com": site,
        },
      })
      const config = createMockConfig()

      const result = getSiteFromUrl("https://www.example.com", sourceData, config)

      expect(result.isOk()).toBe(true)
      if (result.isOk()) {
        expect(result.value.site).toBe(site)
      }
    })

    it("should handle URLs with path", () => {
      const site = createMockSite({ domain: "example.com" })
      const sourceData = createMockSourceData({
        sites_by_domain: {
          "example.com": site,
        },
      })
      const config = createMockConfig()

      const result = getSiteFromUrl("https://example.com/politics/article-123", sourceData, config)

      expect(result.isOk()).toBe(true)
      if (result.isOk()) {
        expect(result.value.site).toBe(site)
      }
    })
  })

  describe("Facebook page handling", () => {
    it("should resolve Facebook page to actual domain", () => {
      const site = createMockSite({ domain: "realnews.com" })
      const sourceData = createMockSourceData({
        sites_by_domain: {
          "realnews.com": site,
        },
        fb_pages: {
          realnews: "realnews.com",
        },
      })
      const config = createMockConfig()

      const result = getSiteFromUrl("https://facebook.com/realnews", sourceData, config)

      expect(result.isOk()).toBe(true)
      if (result.isOk()) {
        expect(result.value.site).toBe(site)
        expect(result.value.final_domain).toBe("realnews.com")
      }
    })

    it("should handle Facebook URL with query params", () => {
      const site = createMockSite({ domain: "realnews.com" })
      const sourceData = createMockSourceData({
        sites_by_domain: {
          "realnews.com": site,
        },
        fb_pages: {
          realnews: "realnews.com",
        },
      })
      const config = createMockConfig()

      const result = getSiteFromUrl("https://www.facebook.com/realnews?ref=share", sourceData, config)

      expect(result.isOk()).toBe(true)
      if (result.isOk()) {
        expect(result.value.site).toBe(site)
      }
    })

    it("should return error for unknown Facebook page", () => {
      const sourceData = createMockSourceData({
        fb_pages: {},
      })
      const config = createMockConfig()

      const result = getSiteFromUrl("https://facebook.com/unknownpage", sourceData, config)

      expect(result.isErr()).toBe(true)
    })

    it("should suggest fb_path when fb_path parameter provided", () => {
      const site = createMockSite({ domain: "realnews.com" })
      const sourceData = createMockSourceData({
        sites_by_domain: {
          "realnews.com": site,
        },
        fb_pages: {}, // Not in fb_pages yet
      })
      const config = createMockConfig()

      const result = getSiteFromUrl("https://realnews.com", sourceData, config, "suggestedpage")

      expect(result.isOk()).toBe(true)
      if (result.isOk()) {
        expect(result.value.suggested_fbtwpath).toBe("suggestedpage")
      }
    })

    it("should not suggest fb_path if already mapped correctly", () => {
      const site = createMockSite({ domain: "realnews.com" })
      const sourceData = createMockSourceData({
        sites_by_domain: {
          "realnews.com": site,
        },
        fb_pages: {
          realnewspage: "realnews.com",
        },
      })
      const config = createMockConfig()

      const result = getSiteFromUrl("https://realnews.com", sourceData, config, "realnewspage")

      expect(result.isOk()).toBe(true)
      if (result.isOk()) {
        expect(result.value.suggested_fbtwpath).toBeUndefined()
      }
    })
  })

  describe("edge cases", () => {
    it("should handle http protocol", () => {
      const site = createMockSite({ domain: "example.com" })
      const sourceData = createMockSourceData({
        sites_by_domain: {
          "example.com": site,
        },
      })
      const config = createMockConfig()

      const result = getSiteFromUrl("http://example.com", sourceData, config)

      expect(result.isOk()).toBe(true)
      if (result.isOk()) {
        expect(result.value.site).toBe(site)
      }
    })

    it("should handle URL with trailing slash", () => {
      const site = createMockSite({ domain: "example.com" })
      const sourceData = createMockSourceData({
        sites_by_domain: {
          "example.com": site,
        },
      })
      const config = createMockConfig()

      const result = getSiteFromUrl("https://example.com/", sourceData, config)

      expect(result.isOk()).toBe(true)
      if (result.isOk()) {
        expect(result.value.site).toBe(site)
      }
    })

    it("should return error for domain not in sources", () => {
      const sourceData = createMockSourceData({
        sites_by_domain: {},
      })
      const config = createMockConfig()

      const result = getSiteFromUrl("https://unknownsite.com", sourceData, config)

      expect(result.isErr()).toBe(true)
    })

    it("should handle case-insensitive domain matching", () => {
      const site = createMockSite({ domain: "example.com" })
      const sourceData = createMockSourceData({
        sites_by_domain: {
          "example.com": site,
        },
      })
      const config = createMockConfig()

      const result = getSiteFromUrl("https://EXAMPLE.COM", sourceData, config)

      expect(result.isOk()).toBe(true)
      if (result.isOk()) {
        expect(result.value.site).toBe(site)
      }
    })
  })

  describe("collapse settings propagation", () => {
    it("should propagate collapse settings from config", () => {
      const site = createMockSite({ domain: "example.com", bias: BiasEnums.Left })
      const sourceData = createMockSourceData({
        sites_by_domain: {
          "example.com": site,
        },
      })
      const config = createMockConfig({
        collapse: {
          ...DefaultCollapse,
          collapseLeft: true,
        },
      })

      const result = getSiteFromUrl("https://example.com", sourceData, config)

      expect(result.isOk()).toBe(true)
      if (result.isOk()) {
        expect(result.value.collapse).toBe(true)
      }
    })
  })
})
