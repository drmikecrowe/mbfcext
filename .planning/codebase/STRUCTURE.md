# Codebase Structure

**Analysis Date:** 2026-02-20

## Directory Layout

```
show_media_bias-main/
├── src/                          # Primary source code
│   ├── background/               # Service worker and background logic
│   ├── contents/                 # Content scripts for web pages
│   ├── options/                  # Settings page UI components
│   ├── shared/                   # Cross-layer utilities and services
│   ├── models/                   # TypeScript type definitions
│   ├── components/               # Reusable UI components
│   ├── popup.tsx                 # Extension popup entry point
│   ├── options.tsx               # Options page entry point
│   ├── constants.ts              # Global constants
│   └── style.css                 # Global popup styles
├── types/                        # Additional type definitions
├── assets/                       # Static assets (icons, images)
├── build/                        # Build output (git-ignored)
├── docs/                         # Documentation and changelog
├── bin/                          # Utility scripts
├── package.json                  # Dependencies and build config
├── tsconfig.json                 # TypeScript configuration
├── .eslintrc.json                # ESLint configuration
├── tailwind.config.js            # Tailwind CSS configuration (if present)
└── devenv.*                      # Development environment config

```

## Directory Purposes

**src/background/**
- Purpose: Service worker code managing extension lifecycle, data fetching, message routing
- Contains: Service worker entry point, message handlers, data processors, event listeners, tab utilities, icons
- Key files: `index.ts`, `sources-processor.ts`, `update-icon.ts`, `tab-listener.ts`, `messages/`, `icons/`, `utils/`

**src/contents/**
- Purpose: Content scripts injected into web pages to detect and annotate stories with media bias
- Contains: Page-specific filter implementations (Facebook, Twitter), DOM selectors, story processing logic
- Key files: `facebook.ts`, `twitter.ts` (entry points), `content/filter.ts`, `content/facebook.ts`, `content/utils/`

**src/options/**
- Purpose: Settings/preferences page UI with tabbed navigation
- Contains: React component tree for options page, tab definitions, settings controls, UI sub-components
- Key files: `options.tsx`, `intro.tsx`, `release-notes.tsx`, `components/tabs.tsx`, `components/tab.tsx`

**src/shared/**
- Purpose: Cross-context utilities usable from background, content scripts, and UI layers
- Contains: Logger wrapper, config storage handler, domain parsing, tab utilities, Google Analytics
- Key files: `logger.ts`, `config-handler.ts`, `get-domain.ts`, `tab-utils.ts`, `google-analytics.ts`, `elements/`

**src/models/**
- Purpose: TypeScript interfaces and enums for media bias data structure
- Contains: Type definitions generated from JSON schema, conversion helpers, validation
- Key files: `combined-manager.ts` (auto-generated comprehensive model)

**src/components/**
- Purpose: Reusable React UI components used across popup and options pages
- Contains: Button component, icon wrappers
- Key files: `button.tsx`

**types/**
- Purpose: Custom TypeScript type definitions not in models
- Contains: Type declarations for extensions, libraries, custom types

**assets/**
- Purpose: Static images and icons for extension UI
- Contains: Extension icons, popup icons, badge images

**docs/**
- Purpose: Documentation, changelog, and version history
- Contains: Markdown docs, version-specific data schemas, generated site files

**build/**
- Purpose: Compiled extension output (created by plasmo build)
- Contains: Platform-specific builds (chrome-mv3-dev, chrome-mv3-prod, firefox-mv3-dev)
- Note: Generated at build time, not committed

## Key File Locations

**Entry Points:**
- `src/background/index.ts`: Service worker initialization, event listeners, promise chain
- `src/popup.tsx`: Popup UI entry point (shown on icon click)
- `src/options.tsx`: Options page entry point
- `src/contents/facebook.ts`: Facebook content script with PlasmoCSConfig
- `src/contents/twitter.ts`: Twitter content script (pattern: src/contents/{site}.ts)

**Configuration:**
- `src/constants.ts`: GA tracking ID, combined.json URL, first-run flag
- `tsconfig.json`: TypeScript compiler options, path aliases (~* → ./src/*)
- `package.json`: Dependencies (React, Plasmo, @plasmohq/*, Tailwind), scripts
- `.eslintrc.json`: ESLint rules and parser config

**Core Logic:**
- `src/background/sources-processor.ts`: Loads and indexes media bias data from GitHub
- `src/background/messages/get-domain-for-tab.ts`: Popup query handler
- `src/background/utils/check-domain.ts`: Domain lookup and site classification logic
- `src/shared/config-handler.ts`: User preferences storage and retrieval
- `src/shared/get-domain.ts`: URL parsing for consistent domain extraction

**Testing:**
- No test files detected (no .test.ts or .spec.ts files in src/)

## Naming Conventions

**Files:**
- Kebab-case for multi-word filenames: `get-domain.ts`, `config-handler.ts`, `update-icon.ts`
- PascalCase for React components: `Button.tsx`, `Tabs.tsx`, `TabGroups.tsx`
- camelCase for utility and service files: `poller.ts`, `logger.ts`
- Index files as `index.ts` or `index.tsx` with barrel exports

**Directories:**
- Lower kebab-case for all directories: `src/`, `src/background/`, `src/contents/`, `src/shared/`
- Feature-based organization in `src/background/messages/`, `src/background/utils/`
- No nested component subdirectories deeper than 2 levels

**Imports:**
- Path aliases: `~background`, `~contents`, `~shared`, `~models`, `~components`, `~popup`, `~options`
- Relative imports avoided in favor of ~-aliased absolute imports

**Exports:**
- Barrel exports in `index.ts` files (auto-generated from bmakeIndex script)
- Re-export specific exports from modules: `export * from './logger'`
- Default exports for React components and content script handlers

## Where to Add New Code

**New Message Handler (Background ↔ Content/Popup):**
- Create: `src/background/messages/{name}.ts`
- Export: Add to `src/background/messages/index.ts`
- Types: Define RequestBody and ResponseBody types in handler file
- Pattern: PlasmoMessaging.MessageHandler<Request, Response> functional handler with const handler = ...

**New Content Script (for new site):**
- Create: `src/contents/{site}.ts` as entry point with PlasmoCSConfig matches
- Create: `src/contents/content/{site}.ts` for site-specific Filter subclass
- Use: Filter base class from `src/contents/content/filter.ts`
- Selectors: Define DOM selectors for story elements specific to site

**New Shared Utility:**
- Create: `src/shared/{name}.ts`
- Export: Add to `src/shared/index.ts` barrel export
- Dependencies: Avoid circular imports; shared utilities should not depend on background/content specific code

**New UI Component (Popup/Options):**
- For options tabs: Create in `src/options/{name}.tsx` and register in `src/options.tsx` tabs array
- For reusable components: Create in `src/components/{name}.tsx` and add to barrel export
- Pattern: React functional component with prop types/interfaces

**New Type/Model:**
- Simple types: Add to `types/` or relevant module's type definitions
- Data models: Update `src/models/combined-manager.ts` (auto-generated from schema)
- Enums: Group by domain (BiasEnums, CredibilityEnums, etc.)

**Configuration:**
- App constants: Update `src/constants.ts`
- User preferences: Update ConfigStorage interface and DefaultCollapse in `src/shared/config-handler.ts`
- Build config: Modify `package.json` manifest section for extension permissions/resources

## Special Directories

**src/background/icons/**
- Purpose: Stores bias-specific badge icons used for extension action icon and story badges
- Generated: Contains color-coded icon variants for each bias category (left, right, center, etc.)
- Committed: Yes, source assets stored here

**src/background/messages/**
- Purpose: Message handler modules for IPC between service worker and content scripts/popup
- Generated: No, manually created per message type
- Committed: Yes, contains handler implementations

**src/shared/elements/**
- Purpose: Small reusable UI elements shared across popup and options pages
- Generated: No
- Committed: Yes, includes Button.tsx, font-awesome.tsx (FontAwesome wrapper)

**src/contents/content/utils/**
- Purpose: Utilities specific to content script DOM manipulation
- Generated: No
- Committed: Yes, includes report-div.ts (custom element definition), cap.ts (text capitalization)

**.plasmo/**
- Purpose: Plasmo build framework cache and generated files
- Generated: Yes, created during build
- Committed: No (git-ignored)

**build/**
- Purpose: Compiled extension output for different platforms
- Generated: Yes, via plasmo build command
- Committed: No (git-ignored)

**docs/**
- Purpose: Documentation site and API schema documentation
- Generated: Partially (site content), source files committed
- Committed: Yes for source .md files and data schemas

---

*Structure analysis: 2026-02-20*
