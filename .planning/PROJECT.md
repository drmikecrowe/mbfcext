# Media Bias/Fact Check Extension (v4.x)

## What This Is

A Chrome and Firefox browser extension that annotates Facebook news feed posts with Media Bias/Fact Check ratings. When a user scrolls their Facebook feed, the extension detects news article links and injects a color-coded bias badge showing the source's rating (Left, Right, Center, Satire, Conspiracy, etc.) pulled from the MBFC database. The extension also provides a popup for looking up the bias of the currently-visited site and a configurable News Search button.

## Core Value

Facebook feed annotation must work reliably — if posts aren't annotated, the extension is useless. Everything else is secondary to detection working correctly.

## Requirements

### Validated

- ✓ Chrome and Firefox browser extension — existing
- ✓ Facebook feed annotation with MBFC bias badges — v4.1 (fixed with `data-ad-rendering-role` detection)
- ✓ Sponsored story collapse/hide — existing
- ✓ Popup for current tab domain lookup — existing
- ✓ Options page for collapse/hide preferences — existing
- ✓ Domain data fetched from GitHub (combined.json) with periodic refresh — existing
- ✓ GA4 analytics (optional, user-controlled) — existing
- ✓ In-memory domain cache indexed by domain/alias — existing
- ✓ Multi-strategy domain matching (direct, subdomain, alias, parent domain) — existing
- ✓ Domain extraction via `[data-ad-rendering-role="meta"]` textContent — v4.1
- ✓ Annotation insertion before engagement block — v4.1
- ✓ Plasmo 0.90.x framework — v4.1
- ✓ React 18.3.x — v4.1
- ✓ TypeScript 5.9.x — v4.1
- ✓ ESLint v8.x — v4.1
- ✓ Node.js 24 compatibility — v4.1
- ✓ News Search button for Facebook posts — v4.1 (configurable)

### Active

(None — ready for next milestone planning)

### Out of Scope

- Twitter/X support — removed in v4.0, no plans to restore
- New platforms (Reddit, YouTube, etc.) — future milestone
- Backend server — extension is fully client-side
- Link preview resolution (reut.rs → actual domain) — domain shown in `meta` role is sufficient
- ESLint v9 flat config — deferred, v8.x is stable
- React 19 — 18.x is stable and well-supported

## Context

**Current State (v4.1):**
- Extension is live in Chrome Web Store and Firefox Add-ons
- Version 4.1 fixed Facebook annotation (broken due to Facebook DOM changes)
- Using `data-ad-rendering-role` attributes for stable post detection
- All core dependencies upgraded to modern versions
- ~3,711 LOC TypeScript

**Tech Stack:**
- Framework: Plasmo 0.90.5 (handles MV3 manifest, bundling, HMR)
- UI: React 18.3.1 + Tailwind CSS
- Language: TypeScript 5.9.3
- Linting: ESLint 8.56.0
- Runtime: Node.js >=24

**Data Source:** MBFC's combined.json from GitHub (no API key, rate limits)

## Constraints

- **Tech Stack**: TypeScript + React + Plasmo (cannot change framework mid-project)
- **Data Source**: MBFC's combined.json from GitHub (no API key, rate limits)
- **Browser Targets**: Chrome (MV3) + Firefox 104.0+ (MV2 via polyfill via webextension-polyfill)
- **No Backend**: Extension must work entirely client-side

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Use `data-ad-rendering-role` as primary post detection | Tied to Facebook's ad system, more stable than randomized CSS classes | ✓ Good |
| Keep FB page path as fallback (not primary) | `meta` domain is more direct and accurate than FB page lookup | ✓ Good |
| Add role="article" fallback | Handles edge cases where data-ad-rendering-role might be missing | ✓ Good |
| ESLint v8 (not v9 flat config) | Less migration risk, v9 flat config requires significant config rewrite | ✓ Good |
| Add News Search button | User-requested feature for searching news topics | ✓ Good |

---
*Last updated: 2026-02-22 after v4.1 milestone completion*
