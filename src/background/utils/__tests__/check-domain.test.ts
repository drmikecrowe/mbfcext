/**
 * Tests for checkDomain utility function.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"

// Mock logger before any imports that use it
vi.mock("~shared/logger", () => ({
  logger: () => vi.fn(),
  isDevMode: () => false,
}))

import { BiasEnums, ReportingEnums } from "~models/combined-manager"
import type { SiteModel } from "~models/combined-manager"
import type { SourceData } from "~background/sources-processor"
import type { ConfigStorage, Collapse } from "~shared/config-handler"

import { checkDomain } from "../check-domain"

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

describe("checkDomain", () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  describe("basic domain checking", () => {
    it("should return unknown result for empty domain", () => {
      const sourceData = createMockSourceData()
      const config = createMockConfig()

      const result = checkDomain("", "", sourceData, config)

      expect(result.isOk()).toBe(true)
      if (result.isOk()) {
        expect(result.value).toMatchObject({
          final_domain: "",
          alias: false,
          baseUrl: false,
          hidden: false,
          collapse: false,
          unknown: true,
          site: null,
        })
      }
    })

    it("should return unknown for domain not in sources", () => {
      const sourceData = createMockSourceData()
      const config = createMockConfig()

      const result = checkDomain("unknown-site.com", "article", sourceData, config)

      expect(result.isOk()).toBe(true)
      if (result.isOk()) {
        expect(result.value.unknown).toBe(true)
        expect(result.value.site).toBeNull()
      }
    })

    it("should find site by exact domain match", () => {
      const site = createMockSite({ domain: "news.example.com" })
      const sourceData = createMockSourceData({
        sites_by_domain: {
          "news.example.com": site,
        },
      })
      const config = createMockConfig()

      const result = checkDomain("news.example.com", "", sourceData, config)

      expect(result.isOk()).toBe(true)
      if (result.isOk()) {
        expect(result.value.unknown).toBe(false)
        expect(result.value.site).toBe(site)
        expect(result.value.final_domain).toBe("news.example.com")
      }
    })
  })

  describe("domain with path matching", () => {
    it("should match domain with path", () => {
      const site = createMockSite({ domain: "news.example.com/politics" })
      const sourceData = createMockSourceData({
        sites_by_domain: {
          "news.example.com/politics": site,
        },
      })
      const config = createMockConfig()

      const result = checkDomain("news.example.com", "politics", sourceData, config)

      expect(result.isOk()).toBe(true)
      if (result.isOk()) {
        expect(result.value.unknown).toBe(false)
        expect(result.value.site).toBe(site)
        expect(result.value.final_domain).toBe("news.example.com/politics")
      }
    })

    it("should not match incorrect path", () => {
      const site = createMockSite({ domain: "news.example.com/politics" })
      const sourceData = createMockSourceData({
        sites_by_domain: {
          "news.example.com/politics": site,
        },
      })
      const config = createMockConfig()

      const result = checkDomain("news.example.com", "sports", sourceData, config)

      expect(result.isOk()).toBe(true)
      if (result.isOk()) {
        expect(result.value.unknown).toBe(true)
      }
    })
  })

  describe("alias handling", () => {
    it("should resolve domain alias", () => {
      const site = createMockSite({ domain: "real-domain.com" })
      const sourceData = createMockSourceData({
        sites_by_domain: {
          "real-domain.com": site,
        },
        combined: {
          aliases: {
            "alias-domain.com": "real-domain.com",
          },
          biases: [],
          credibility: [],
          date: "2024-01-01",
          questionable: [],
          reporting: [],
          sources: [],
          traffic: [],
          version: 1,
        },
      })
      const config = createMockConfig()

      const result = checkDomain("alias-domain.com", "", sourceData, config)

      expect(result.isOk()).toBe(true)
      if (result.isOk()) {
        expect(result.value.unknown).toBe(false)
        expect(result.value.alias).toBe(true)
        expect(result.value.site).toBe(site)
      }
    })
  })

  describe("base URL handling (domain stripping)", () => {
    it("should match base domain when subdomain not found", () => {
      const site = createMockSite({ domain: "example.com" })
      const sourceData = createMockSourceData({
        sites_by_domain: {
          "example.com": site,
        },
      })
      const config = createMockConfig()

      const result = checkDomain("sub.example.com", "", sourceData, config)

      expect(result.isOk()).toBe(true)
      if (result.isOk()) {
        expect(result.value.unknown).toBe(false)
        expect(result.value.baseUrl).toBe(true)
        expect(result.value.site).toBe(site)
      }
    })
  })

  describe("collapse settings", () => {
    it("should set collapse flag when bias is configured to collapse", () => {
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

      const result = checkDomain("example.com", "", sourceData, config)

      expect(result.isOk()).toBe(true)
      if (result.isOk()) {
        expect(result.value.collapse).toBe(true)
      }
    })

    it("should collapse conspiracy sites by default", () => {
      const site = createMockSite({ domain: "example.com", bias: BiasEnums.ConspiracyPseudoscience })
      const sourceData = createMockSourceData({
        sites_by_domain: {
          "example.com": site,
        },
      })
      const config = createMockConfig()

      const result = checkDomain("example.com", "", sourceData, config)

      expect(result.isOk()).toBe(true)
      if (result.isOk()) {
        expect(result.value.collapse).toBe(true)
      }
    })

    it("should collapse mixed reporting when configured", () => {
      const site = createMockSite({
        domain: "example.com",
        bias: BiasEnums.Center,
        reporting: ReportingEnums.Mixed,
      })
      const sourceData = createMockSourceData({
        sites_by_domain: {
          "example.com": site,
        },
      })
      const config = createMockConfig({
        collapse: {
          ...DefaultCollapse,
          collapseMixed: true,
        },
      })

      const result = checkDomain("example.com", "", sourceData, config)

      expect(result.isOk()).toBe(true)
      if (result.isOk()) {
        expect(result.value.collapse).toBe(true)
      }
    })
  })

  describe("hidden sites handling", () => {
    it("should mark site as hidden when in hiddenSites", () => {
      const site = createMockSite({ domain: "example.com" })
      const sourceData = createMockSourceData({
        sites_by_domain: {
          "example.com": site,
        },
      })
      const config = createMockConfig({
        hiddenSites: {
          "example.com": true,
        },
      })

      const result = checkDomain("example.com", "", sourceData, config)

      expect(result.isOk()).toBe(true)
      if (result.isOk()) {
        expect(result.value.hidden).toBe(true)
        expect(result.value.collapse).toBe(true)
      }
    })

    it("should uncollapse site when explicitly set to false in hiddenSites", () => {
      const site = createMockSite({ domain: "example.com" })
      const sourceData = createMockSourceData({
        sites_by_domain: {
          "example.com": site,
        },
      })
      const config = createMockConfig({
        collapse: {
          ...DefaultCollapse,
          collapseLeft: true, // Would normally collapse
        },
        hiddenSites: {
          "example.com": false, // But this overrides
        },
      })

      const result = checkDomain("example.com", "", sourceData, config)

      expect(result.isOk()).toBe(true)
      if (result.isOk()) {
        expect(result.value.collapse).toBe(false)
      }
    })
  })

  describe("subdomain handling with paths", () => {
    it("should check subdomain paths when domain has path in sites_by_domain", () => {
      // This tests the case where a site has a domain like "example.com/politics"
      // stored in sites_by_domain, and we check with domain+path
      const site = createMockSite({ domain: "example.com/politics" })
      const sourceData = createMockSourceData({
        sites_by_domain: {
          "example.com/politics": site,
        },
      })
      const config = createMockConfig()

      // The checkDomain function first checks `${domain}/${path}` before checking subdomains
      const result = checkDomain("example.com", "politics", sourceData, config)

      expect(result.isOk()).toBe(true)
      if (result.isOk()) {
        expect(result.value.unknown).toBe(false)
        expect(result.value.site).toBe(site)
        expect(result.value.final_domain).toBe("example.com/politics")
      }
    })
  })

  describe("error cases and edge cases", () => {
    it("should handle empty sites_by_domain", () => {
      const sourceData = createMockSourceData({
        sites_by_domain: {},
      })
      const config = createMockConfig()

      const result = checkDomain("example.com", "", sourceData, config)

      expect(result.isOk()).toBe(true)
      if (result.isOk()) {
        expect(result.value.unknown).toBe(true)
      }
    })

    it("should handle domain with only one part (no TLD)", () => {
      const sourceData = createMockSourceData()
      const config = createMockConfig()

      const result = checkDomain("localhost", "", sourceData, config)

      expect(result.isOk()).toBe(true)
      if (result.isOk()) {
        expect(result.value.unknown).toBe(true)
      }
    })

    it("should handle very long paths", () => {
      const site = createMockSite({ domain: "example.com" })
      const sourceData = createMockSourceData({
        sites_by_domain: {
          "example.com": site,
        },
      })
      const config = createMockConfig()

      const longPath = "a/b/c/d/e/f/g/h/i/j/k/l/m/n/o/p"
      const result = checkDomain("example.com", longPath, sourceData, config)

      expect(result.isOk()).toBe(true)
      if (result.isOk()) {
        expect(result.value.unknown).toBe(false)
      }
    })

    it("should handle special characters in domain", () => {
      const sourceData = createMockSourceData()
      const config = createMockConfig()

      const result = checkDomain("example-.com", "", sourceData, config)

      expect(result.isOk()).toBe(true)
    })
  })
})
