# External Integrations

**Analysis Date:** 2024-02-22

## APIs & External Services

**Google Analytics:**
- Google Analytics 4 (GA4) - Usage analytics tracking
- SDK: `@analytics-debugger/ga4mp` v0.0.8
- Implementation: Custom implementation in `src/shared/google-analytics.ts`
  - Event tracking for site shows, collapses, hides
  - User opt-out support via `mbfcBlockAnalytics` config
  - Non-personalized ads enabled
  - Debug mode enabled for development
  - Measurement Protocol endpoint
- Auth: No authentication required (public measurement protocol)

**MBFC Data Source:**
- Media Bias/Fact Check data
- Endpoint: GitHub raw content URL
  - URL: `https://raw.githubusercontent.com/drmikecrowe/mbfcext/master/docs/v5/data/combined.json`
  - Client: Native `fetch()` API in `src/background/sources-processor.ts`
  - Purpose: Loads media bias ratings and site information
  - Caching: Managed locally with timestamp in extension storage
- Auth: No authentication required (public GitHub content)

## Data Storage

**Extension Storage:**
- Browser extension storage API
- Client: `@plasmohq/storage` v1.9.3
  - Stores user preferences, hidden sites, configuration
  - Persists across browser sessions
  - Supports both Chrome and Firefox storage backends

**File Storage:**
- No external file storage detected
- Uses browser extension storage only

**Caching:**
- In-memory caching in `src/background/sources-processor.ts`
- Local extension storage with timestamp (`last_load_date`)
- No external caching service

## Authentication & Identity

**Auth Provider:**
- No external authentication provider
- User data stored locally in extension storage
- No user accounts or login required

**Implementation:**
- Anonymous usage only
- No authentication headers or tokens needed

## Monitoring & Observability

**Error Tracking:**
- No external error tracking service
- Uses browser console logging via `debug` library
- Custom logging implementation in `src/shared/logger.ts`

**Logs:**
- Browser console output
- Debug logging with `debug` library
- Structured logging with category prefixes

## CI/CD & Deployment

**Hosting:**
- No external hosting service
- Extension distributed via browser extension stores (Chrome Web Store, Firefox Add-ons)
- Source hosted on GitHub (drmikecrowe/mbfcext)

**CI Pipeline:**
- No configured CI/CD pipeline detected
- Manual build and package process via `plasmo build`

## Environment Configuration

**Required env vars:**
- No runtime environment variables required
- Development uses `.envrc` for devenv setup

**Secrets location:**
- No secrets required
- All configuration stored in extension or hardcoded

## Webhooks & Callbacks

**Incoming:**
- No webhook endpoints
- No external API callbacks received

**Outgoing:**
- Analytics events sent to Google Analytics
- Data fetched from GitHub raw content
- No other outbound API calls detected

---

*Integration audit: 2024-02-22*