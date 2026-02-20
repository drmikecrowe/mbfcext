# External Integrations

**Analysis Date:** 2026-02-20

## APIs & External Services

**Data Source:**
- GitHub Raw Content API - `https://raw.githubusercontent.com/drmikecrowe/mbfcext/master/docs/v5/data/combined.json`
  - SDK/Client: Native `fetch()` in `src/background/sources-processor.ts`
  - Purpose: Fetches JSON data containing media bias/fact check information for all sources
  - Update frequency: Every 30 minutes (configurable via `pollMinutes` config)

**Analytics:**
- Google Analytics 4 (GA4) - Measurement Protocol integration
  - Tracking ID: `G-0MYFRRVGKH` (from `src/constants.ts`)
  - SDK/Client: `@analytics-debugger/ga4mp` 0.0.8
  - Auth: Client-side measurement (no authentication required)
  - Implementation: `src/shared/google-analytics.ts`
  - Events tracked:
    - `show-site` - When user expands a site's media bias info
    - `collapse-site` - When user collapses a site's info
    - `unknown-site` - When an unknown site is encountered
    - `associate-site` - When user associates a new social media account
    - `hide-site` - When user hides a site from results
    - `unhide-site` - When user unhides a site
    - `reset-ignored` - When user resets ignored sites
    - `sponsored-hidden` - When sponsored content is hidden
  - Privacy: Users can opt-out via `mbfcBlockAnalytics` config setting

**Payment/Donations:**
- PayPal
  - Link: `https://paypal.me/drmikecrowe` (hardcoded in `src/contents/content/filter.ts`)
  - Purpose: Donation endpoint for extension creator

## Data Storage

**Browser Storage:**
- **Type:** Browser Extension Local Storage (WebExtension Storage API)
- **Client:** `@plasmohq/storage` wrapper (abstraction over `chrome.storage.local` and `chrome.storage.sync`)
- **Implementation:** `src/shared/config-handler.ts`
- **What's stored:**
  - Collapse settings (11 bias categories): `collapseLeft`, `collapseLeftCenter`, `collapseCenter`, `collapseRightCenter`, `collapseRight`, `collapseProScience`, `collapseConspiracy`, `collapseSatire`, `collapseFakeNews`, `collapseMixed`, `collapseSponsored`
  - Hidden sites: `hiddenSites` Record<domain, boolean>
  - Unknown sites: `unknown` Record<domain, boolean>
  - Analytics preference: `mbfcBlockAnalytics`
  - Poll interval: `pollMinutes`
  - Last run timestamp: `lastRun`
  - First run flag: `firstrun`
  - Loaded status: `loaded`
- **Scope:** Per-browser, per-user (browser extension storage)

**In-Memory Data Cache:**
- **Source data:** Processed and cached in `SourcesProcessor` singleton
- **Structure:** `src/background/sources-processor.ts`
  - Full combined model (all sources)
  - Indexed maps: `subdomains`, `fb_pages`, `tw_pages`, `sites_by_domain`, `name_pages`
  - Last load tracking: `LAST_LOAD_KEY`

**File Storage:**
- Local filesystem only (None - extension runs in browser sandbox)

**Caching:**
- Browser extension storage cache only
- No Redis, Memcached, or external cache layer

## Authentication & Identity

**Auth Provider:**
- None - Extension runs without user authentication
- Anonymous usage (no user accounts)

## Monitoring & Observability

**Error Tracking:**
- None detected (no Sentry, Rollbar, or similar integration)

**Logs:**
- Browser console logging via custom `logger` utility in `src/shared/logger.ts`
- Debug namespace: `mbfc:*` (uses `debug` package 4.3.4)
- Log levels visible in development mode
- Storage of logs: None (console only)

## CI/CD & Deployment

**Hosting:**
- GitHub releases (distributed as browser extension)
- Chrome Web Store
- Firefox Add-ons Store

**CI Pipeline:**
- GitHub Actions workflow (`.github/workflows/submit.yml`)
- Auto-submission workflow configured

**Build/Package:**
- `plasmo build` - Generates web extension bundles
- `plasmo package` - Creates distributable packages for stores

## Environment Configuration

**Required env vars:**
- `NODE_ENV` - Build environment detection (checked in `src/shared/logger.ts`)

**Optional config:**
- `.env` files not used (extension runs clientside, no secrets in code)
- Configuration persisted to browser storage instead

**Secrets location:**
- No secrets stored in codebase
- Google Analytics ID is public (not a secret)
- All credentials handled via browser storage

## Webhooks & Callbacks

**Incoming:**
- None - Extension is passive (only responds to user interactions and scheduled updates)

**Outgoing:**
- Google Analytics events sent to `https://www.google-analytics.com/` (via ga4mp SDK)
- No custom webhook integrations

## Browser APIs Used

**Extension APIs:**
- `chrome.tabs.*` - Tab management (highlight, activate, update)
- `chrome.windows.*` - Window focus tracking
- `chrome.alarms.*` - Scheduling background tasks (polling every 30 minutes)
- `chrome.storage.local` - Persistent storage (via @plasmohq/storage)
- `chrome.runtime.*` - Event handling (onInstalled, onStartup, onMessage)

**Web APIs:**
- `fetch()` - HTTP requests for combined data source
- `webextension-polyfill` - Firefox compatibility layer for Chrome WebExtension API
- `window.open()` - Opens external links (PayPal donation, fact-check website)

## Data Sources

**Media Bias/Fact Check Data:**
- Source: `https://raw.githubusercontent.com/drmikecrowe/mbfcext/master/docs/v5/data/combined.json`
- Format: JSON with combined data structure (CombinedModel)
- Contains:
  - 1000+ source domains with bias ratings
  - Bias enums (Left, Left-Center, Center, Right-Center, Right, Pro-Science, Conspiracy, Satire, Fake News, Mixed)
  - Credibility ratings
  - Reporting quality ratings
  - Traffic data
  - Facebook and Twitter page associations

---

*Integration audit: 2026-02-20*
