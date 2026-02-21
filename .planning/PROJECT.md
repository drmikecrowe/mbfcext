# Media Bias/Fact Check Extension (v4.x)

## What This Is

A Chrome and Firefox browser extension that annotates Facebook news feed posts with Media Bias/Fact Check ratings. When a user scrolls their Facebook feed, the extension detects news article links and injects a color-coded bias badge showing the source's rating (Left, Right, Center, Satire, Conspiracy, etc.) pulled from the MBFC database. The extension also provides a popup for looking up the bias of the currently-visited site.

## Core Value

Facebook feed annotation must work reliably — if posts aren't annotated, the extension is useless. Everything else is secondary to detection working correctly.

## Research Findings (2026-02-21)

**Key DOM research conducted via live browser inspection:**

### What Broke (Old Approach)
- Old selector: `div[role='article'][aria-posinset]` — **completely gone**. Facebook removed `aria-posinset` from article elements.
- The old inner selectors (`div[data-visualcompletion="ignore-dynamic"]` for like buttons, `h3 span > a` for page names, `span[dir='auto'] > span:not(:has(*))` for domains) are all broken.

### New Stable API: `data-ad-rendering-role`
Facebook now marks all feed post sections with `data-ad-rendering-role` attributes. These are consistent across both the home News Feed and Facebook Pages:

| Role | Content | Use |
|------|---------|-----|
| `profile_name` | The posting page/person | Post container anchor + fallback domain lookup |
| `story_message` | The post text | — |
| `meta` | **The article domain as plain text** (e.g., "reuters.com") | **Primary domain source** |
| `title` | Article headline | — |
| `description` | Article summary | — |
| `like_button` | Engagement block anchor | **Insertion point marker** |
| `comment_button` | Engagement | — |
| `share_button` | Engagement | — |
| `image` | Media/link image | — |

### New Post Detection Algorithm
```
1. Find all [data-ad-rendering-role="like_button"] elements not already processed
2. For each: walk up DOM to find nearest ancestor that also contains [data-ad-rendering-role="profile_name"]
3. That ancestor IS the post container
4. Deduplicate containers (Set)
```

### Domain Extraction
- **Primary**: `post.querySelector('[data-ad-rendering-role="meta"]').textContent.trim().toLowerCase()` — gives the article domain directly
- **Fallback**: Extract path from `post.querySelector('[data-ad-rendering-role="profile_name"] a[href*="facebook.com"]').href` → Facebook page path (e.g., `/Reuters`)

### Annotation Insertion Point
The child of the post container that contains `like_button` is the engagement bar (always the last block). Insert annotation immediately before it:
```javascript
const engagementBlock = Array.from(post.children).find(c => c.contains(likeBtn));
engagementBlock.before(annotationElement);
```

### Post Structure
All posts observed have 4 top-level blocks:
- Block 0: FB internal/tracking content
- Block 1: Profile header (`profile_name`)
- Block 2: Content (`story_message` + optional link preview with `meta`+`title`+`description`)
- Block 3: Engagement bar (`like_button`+`comment_button`+`share_button`) ← insert before this

## Requirements

### Validated

- ✓ Chrome and Firefox browser extension — existing
- ✓ Facebook feed annotation with MBFC bias badges — existing (currently broken)
- ✓ Sponsored story collapse/hide — existing
- ✓ Popup for current tab domain lookup — existing
- ✓ Options page for collapse/hide preferences — existing
- ✓ Domain data fetched from GitHub (combined.json) with periodic refresh — existing
- ✓ GA4 analytics (optional, user-controlled) — existing
- ✓ In-memory domain cache indexed by domain/alias — existing
- ✓ Multi-strategy domain matching (direct, subdomain, alias, parent domain) — existing

### Active

- [ ] Fix Facebook annotation: replace broken `div[role='article'][aria-posinset]` approach with `data-ad-rendering-role` based detection
- [ ] Domain extraction via `[data-ad-rendering-role="meta"]` textContent (primary) with FB page path fallback
- [ ] Annotation insertion before engagement block (`[data-ad-rendering-role="like_button"]` container)
- [ ] Upgrade Plasmo from 0.84.2 → latest (currently 0.89.x)
- [ ] Upgrade React from 18.2.0 → latest 18.x (or 19 if stable)
- [ ] Upgrade TypeScript from 5.3.3 → 5.7.x
- [ ] Upgrade ESLint from v5.x → v8.x (or v9.x flat config)
- [ ] Verify Node.js 22 LTS compatibility (currently targets `>=20`)
- [ ] Verify Manifest V3 compliance after upgrades

### Out of Scope

- Twitter/X support — removed in v4.0, no plans to restore
- New platforms (Reddit, YouTube, etc.) — future milestone
- Backend server — extension is fully client-side
- Link preview resolution (reut.rs → actual domain) — domain shown in `meta` role is sufficient

## Context

- Extension is live in Chrome Web Store and Firefox Add-ons
- Version 4.0 removed Twitter support, added sponsored story collapse
- README says "Upgraded to Node 18" in v4.0 release notes, but `package.json` already specifies `>=20` — this is inconsistent and should be cleaned up
- Plasmo framework handles MV3 manifest generation, bundling, and hot reload
- Data source: public GitHub JSON (no auth required)
- `data-ad-rendering-role` attributes appear tied to Facebook's ad rendering infrastructure — likely more stable than DOM class names which Facebook randomizes

## Constraints

- **Tech Stack**: TypeScript + React + Plasmo (cannot change framework mid-project)
- **Data Source**: MBFC's combined.json from GitHub (no API key, rate limits)
- **Browser Targets**: Chrome (MV3) + Firefox 104.0+ (MV2 via polyfill via webextension-polyfill)
- **No Backend**: Extension must work entirely client-side

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Use `data-ad-rendering-role` as primary post detection | Tied to Facebook's ad system, more stable than randomized CSS classes | — Pending |
| Keep FB page path as fallback (not primary) | `meta` domain is more direct and accurate than FB page lookup | — Pending |
| Upgrade Plasmo before fixing FB detection | Ensures fix runs on current framework, avoids double-work | — Pending |
| ESLint v8 (not v9 flat config) | Less migration risk, v9 flat config requires significant config rewrite | — Pending |

---
*Last updated: 2026-02-21 after initialization + live DOM research*
