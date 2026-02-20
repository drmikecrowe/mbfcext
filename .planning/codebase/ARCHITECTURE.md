# Architecture

**Analysis Date:** 2026-02-20

## Pattern Overview

**Overall:** Browser Extension with Message-Driven Backend + Content Script Layer

**Key Characteristics:**
- Three-tier architecture: Background Service Worker, Content Scripts, UI Layer (Popup/Options)
- Message-passing communication via @plasmohq/messaging for cross-context async operations
- Singleton pattern for shared services (SourcesProcessor, ConfigHandler, TabListener)
- Domain-based lookup pattern for media bias classification
- React component-driven UI for popup and settings pages

## Layers

**Background Service Worker:**
- Purpose: Central hub managing sources data, message routing, icon updates, tab lifecycle monitoring
- Location: `src/background/`
- Contains: Service worker entry point, message handlers, data processors, event listeners
- Depends on: @plasmohq/messaging, @plasmohq/storage, models (CombinedModel), Chrome APIs
- Used by: Content scripts and popup via messaging, Chrome event listeners

**Content Scripts:**
- Purpose: Inject into Facebook/Twitter pages to detect and annotate media bias on story links
- Location: `src/contents/`
- Contains: Page-specific filters (Facebook, Twitter), DOM manipulation, story detection logic
- Depends on: Background messages, ConfigHandler, CheckDomain utilities, DOM APIs
- Used by: Browser tab pages directly

**UI Layer (Popup & Options):**
- Purpose: User-facing interfaces for quick lookup (popup) and preference configuration (options)
- Location: `src/popup.tsx`, `src/options.tsx`, `src/options/`
- Contains: React components, tab navigation, settings controls
- Depends on: @plasmohq/messaging, models, shared utilities
- Used by: Browser popup icon click, extension options page

**Shared Utilities:**
- Purpose: Cross-context utilities for domain parsing, logging, configuration, Google Analytics
- Location: `src/shared/`
- Contains: Logger wrapper, ConfigHandler (storage management), domain extraction, tab utilities
- Depends on: @plasmohq/storage, Chrome APIs, debug library
- Used by: All layers

**Models & Data:**
- Purpose: Define TypeScript interfaces for media bias classification data structure
- Location: `src/models/combined-manager.ts`
- Contains: CombinedModel interface, BiasModel, SiteModel, enums for bias/credibility/traffic categories
- Depends on: No dependencies (pure types)
- Used by: All layers for type safety

## Data Flow

**Initial Load Flow:**

1. Background service worker initializes at `src/background/index.ts`
2. SourcesProcessor singleton retrieves combined.json from GitHub (URL in `src/constants.ts`)
3. Combined data is deserialized into CombinedModel and indexed by domain into `sites_by_domain` Map
4. ConfigHandler retrieves user settings from chrome.storage.sync
5. Both promises resolve via `Promise.all()`, marking extension ready

**Tab/Popup Query Flow:**

1. User clicks extension popup or popup.tsx loads
2. Popup component calls `getCurrentTab()` to get active tab URL
3. getDomain utility extracts hostname and path from URL
4. Popup sends `GET_DOMAIN_FOR_TAB` message to background via @plasmohq/messaging
5. Background handler (get-domain-for-tab.ts) looks up domain in `sites_by_domain` cache
6. Handler retrieves matching SiteModel and associated BiasModel (color, description)
7. Response includes bias rating, description, and MBFC link
8. Popup renders PopupDetails component with site information

**Content Script Annotation Flow:**

1. Facebook content script (src/contents/facebook.ts) injects into https://facebook.com/*
2. Facebook.getInstance() initializes Filter with "article" selector
3. Filter scans DOM for story links, extracts domain from href attributes
4. For each domain, checkDomain utility (src/background/utils/check-domain.ts) validates:
   - Direct domain match in sites_by_domain
   - Subdomain path matching
   - Domain alias lookup
   - Parent domain fallback
5. If site found, ReportDiv custom element displays bias badge with color-coded icon
6. User can hide/unhide specific sites via HIDE_SITE message
7. Collapse configuration determines if stories auto-hide per bias category

**State Management:**

- SourcesProcessor maintains in-memory cache of combined.json data and indexed domains
- ConfigHandler uses chrome.storage.sync for user preferences (collapse states, hidden sites)
- Filter instances maintain local DOM state tracking which stories have been processed

## Key Abstractions

**SourcesProcessor:**
- Purpose: Singleton managing all sources data lifecycle and querying
- Examples: `src/background/sources-processor.ts`
- Pattern: Lazy-loads combined.json, indexes by domain/subdomain/alias, provides read-only access via getInstance()
- Key Methods: getSourceData(), updateFacebook(), updateTwitter(), updateName()

**ConfigHandler:**
- Purpose: Abstraction over chrome.storage.sync for extension preferences
- Examples: `src/shared/config-handler.ts`
- Pattern: Singleton with ConfigStorage interface defining collapse states, hidden sites, poll intervals
- Key Methods: retrieve(), get(), set()

**Filter:**
- Purpose: Page-specific annotation logic for processing stories and adding bias badges
- Examples: `src/contents/content/filter.ts`, `src/contents/content/facebook.ts`
- Pattern: Base Filter class with Story interface for tracking annotation state
- Key Methods: processStory(), hideStory(), showStory()

**Message Handlers:**
- Purpose: Request-response handlers for background tasks callable from content scripts/popup
- Examples: `src/background/messages/get-domain-for-tab.ts`, `src/background/messages/hide-site.ts`
- Pattern: PlasmoMessaging.MessageHandler<RequestBody, ResponseBody> functional handlers
- Handlers: GET_DOMAIN_FOR_TAB, HIDE_SITE, RESET_IGNORED, GET_DOMAIN_FOR_FILTER

**getDomain Utility:**
- Purpose: Consistent domain extraction from URLs across all layers
- Examples: `src/shared/get-domain.ts`
- Pattern: Pure function that normalizes hostnames, removes www prefix, extracts pathname
- Returns: { domain: string, path: string }

**CheckDomainResults:**
- Purpose: Encapsulate domain lookup results with metadata about site state
- Examples: `src/background/utils/check-domain.ts`
- Pattern: Result type using neverthrow for error handling
- Returns: CheckDomainResults with site reference, alias detection, collapse/hidden flags

## Entry Points

**Service Worker:**
- Location: `src/background/index.ts`
- Triggers: Extension load, chrome startup
- Responsibilities: Initialize SourcesProcessor and ConfigHandler, attach event listeners for tabs, listen for messages

**Content Scripts:**
- Location: `src/contents/facebook.ts`, `src/contents/twitter.ts` (manifest match patterns)
- Triggers: Page navigation to matched domains (facebook.com, twitter.com)
- Responsibilities: Detect stories, query background for bias info, inject bias badges

**Popup:**
- Location: `src/popup.tsx`
- Triggers: User clicks extension icon
- Responsibilities: Display media bias info for current tab's domain

**Options Page:**
- Location: `src/options.tsx`
- Triggers: User opens extension options/settings
- Responsibilities: Display settings tabs (intro, settings, release notes), manage collapse/hidden preferences

## Error Handling

**Strategy:** Graceful degradation with logging and null checks

**Patterns:**
- neverthrow Result<T, E> type for checkDomain errors (returns Ok() with unknown flag set)
- Try-catch in getDomain with silent failure (invalid URLs return empty domain/path)
- Null checks before accessing sourceData in message handlers (logs "Domains not loaded")
- Async/await with .catch() logging in popup and content script main functions
- Log levels controlled by isDevMode() for verbose dev vs. silent production logging

## Cross-Cutting Concerns

**Logging:**
- Centralized logger wrapper at `src/shared/logger.ts`
- Namespaced debug instances per module (e.g., "mbfc:background:index", "mbfc:content:filter")
- Controlled by isDevMode() environment detection

**Validation:**
- Domain validation in getDomain (URL parsing with try-catch)
- Type validation in CombinedModel.Convert with schema casting
- BiasEnums validation at deserialization time

**Authentication:**
- No authentication required (data from public GitHub repo)
- Chrome extension permissions: tabs, storage, alarms, host_permissions for Facebook/Twitter

**Configuration:**
- User preferences stored in chrome.storage.sync (collapse states, hidden sites, poll interval)
- Defaults defined in DefaultCollapse and ConfigStorage interface
- Poll interval for data refresh managed by ConfigHandler

**Data Fetching:**
- Single source of truth: combined.json from GitHub (URL in constants.ts)
- Lazy loading on extension startup
- In-memory caching with no persistence (fetched on each extension reload)

---

*Architecture analysis: 2026-02-20*
