import { describe, it, expect } from "vitest"

import { getDomain } from "../get-domain"

describe("getDomain", () => {
  describe("basic URL parsing", () => {
    it("should parse a simple URL", () => {
      const result = getDomain("https://example.com")
      expect(result).toEqual({ domain: "example.com", path: "" })
    })

    it("should parse URL with path", () => {
      const result = getDomain("https://example.com/article/123")
      expect(result).toEqual({ domain: "example.com", path: "article/123" })
    })

    it("should parse URL with query string", () => {
      const result = getDomain("https://example.com/page?foo=bar")
      expect(result).toEqual({ domain: "example.com", path: "page" })
    })

    it("should parse URL with trailing slash", () => {
      const result = getDomain("https://example.com/path/")
      expect(result).toEqual({ domain: "example.com", path: "path" })
    })

    it("should parse URL with leading slash in path", () => {
      const result = getDomain("https://example.com/path")
      expect(result).toEqual({ domain: "example.com", path: "path" })
    })
  })

  describe("www prefix handling", () => {
    it("should strip www prefix", () => {
      const result = getDomain("https://www.example.com")
      expect(result.domain).toBe("example.com")
    })

    it("should strip www2 prefix", () => {
      const result = getDomain("https://www2.example.com")
      expect(result.domain).toBe("example.com")
    })

    it("should strip www9 prefix", () => {
      const result = getDomain("https://www9.example.com")
      expect(result.domain).toBe("example.com")
    })
  })

  describe("protocol handling", () => {
    it("should handle http protocol", () => {
      const result = getDomain("http://example.com")
      expect(result).toEqual({ domain: "example.com", path: "" })
    })

    it("should add https protocol if missing", () => {
      const result = getDomain("example.com")
      expect(result).toEqual({ domain: "example.com", path: "" })
    })
  })

  describe("case normalization", () => {
    it("should lowercase domain", () => {
      const result = getDomain("https://EXAMPLE.COM")
      expect(result.domain).toBe("example.com")
    })

    it("should lowercase path", () => {
      const result = getDomain("https://example.com/ARTICLE/123")
      expect(result.path).toBe("article/123")
    })
  })

  describe("edge cases", () => {
    it("should return empty strings for empty input", () => {
      const result = getDomain("")
      expect(result).toEqual({ domain: "", path: "" })
    })

    it("should return empty strings for null-like input", () => {
      const result = getDomain(null as any)
      expect(result).toEqual({ domain: "", path: "" })
    })

    it("should return empty strings for undefined input", () => {
      const result = getDomain(undefined as any)
      expect(result).toEqual({ domain: "", path: "" })
    })

    it("should handle URLs without dots (no valid domain)", () => {
      const result = getDomain("localhost")
      expect(result).toEqual({ domain: "", path: "" })
    })

    it("should handle invalid URL gracefully", () => {
      const result = getDomain("not a valid url")
      expect(result).toEqual({ domain: "", path: "" })
    })

    it("should handle malformed URL with special chars", () => {
      const result = getDomain("https://example.com/<script>")
      // Should not throw, returns some result
      expect(result).toBeDefined()
      expect(typeof result.domain).toBe("string")
      expect(typeof result.path).toBe("string")
    })
  })

  describe("complex paths", () => {
    it("should handle deeply nested path", () => {
      const result = getDomain("https://example.com/a/b/c/d/e/f")
      expect(result.path).toBe("a/b/c/d/e/f")
    })

    it("should handle path with multiple query params", () => {
      const result = getDomain("https://example.com/search?q=test&page=1")
      expect(result.path).toBe("search")
    })

    it("should handle path with hash", () => {
      const result = getDomain("https://example.com/page#section")
      // Hash is part of the URL but pathname doesn't include it
      expect(result.path).toBe("page")
    })
  })

  describe("subdomain handling", () => {
    it("should preserve subdomains other than www", () => {
      const result = getDomain("https://blog.example.com")
      expect(result.domain).toBe("blog.example.com")
    })

    it("should handle multiple subdomains", () => {
      const result = getDomain("https://a.b.c.example.com")
      expect(result.domain).toBe("a.b.c.example.com")
    })
  })
})
