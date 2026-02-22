# Codebase Structure

**Analysis Date:** 2026-02-22

## Directory Layout

```
media-bias-fact-check/
├── src/                          # Source code
│   ├── background/               # Background service worker
│   │   ├── index.ts              # Background service entry point
│   │   ├── messages/             # Message handlers
│   │   ├── sources-processor.ts  # Data fetching and processing
│   │   └── update-icon.ts        # Icon update logic
│   ├── components/               # Reusable UI components
│   │   └── button.tsx            # Button component
│   ├── contents/                 # Content scripts
│   │   ├── facebook.ts           # Facebook content script entry
│   │   └── content/              # Content script implementations
│   │       ├── filter.ts         # Base filter class
│   │       ├── facebook.ts       # Facebook-specific logic
│   │       └── utils/            # Content script utilities
│   │           ├── cap.ts        # CAPTCHA handling
│   │           └── report-div.ts # Report display component
│   ├── models/                   # TypeScript interfaces and models
│   │   ├── index.ts              # Model exports
│   │   └── combined-manager.ts  # Combined data model and converters
│   ├── options/                  # Options page components
│   │   ├── index.ts              # Options page router
│   │   ├── intro.tsx             # Introduction tab
│   │   ├── options.tsx           # Main settings tab
│   │   ├── release-notes.tsx     # Release notes tab
│   │   └── components/           # Options components
│   │       ├── icons.tsx         # Tab icons
│   │       ├── tab-contents.tsx  # Tab content container
│   │       ├── tab-groups.tsx    # Tab grouping
│   │       ├── tab.tsx          # Individual tab component
│   │       └── tabs.tsx         # Tab navigation
│   ├── popup.tsx                 # Popup interface
│   ├── shared/                   # Cross-layer utilities
│   │   ├── index.ts              # Shared exports
│   │   ├── config-handler.ts     # Configuration management
│   │   ├── get-domain.ts         # Domain extraction
│   │   ├── google-analytics.ts   # GA integration
│   │   ├── logger.ts             # Logging utilities
│   │   ├── tab-utils.ts          # Tab utilities
│   │   └── cap.ts               # Shared CAPTCHA handling
│   ├── constants.ts              # Application constants
│   ├── options.tsx               # Options page entry
│   └── style.css                # Global styles
├── assets/                       # Static assets (icons, etc.)
├── docs/                         # Documentation
├── .github/                     # GitHub workflows
├── .plasmo/                      # Plasmo framework config
├── node_modules/                 # Dependencies
└── build/                       # Build output
```

## Directory Purposes

**src/background/:**
- Purpose: Background service worker and message handling
- Contains: Extension lifecycle management, data processing, inter-process messaging
- Key files: `index.ts` (main service), `sources-processor.ts` (data management), `messages/` (handlers)

**src/contents/:**
- Purpose: Content scripts for DOM manipulation on target sites
- Contains: Facebook-specific post detection and filtering logic
- Key files: `facebook.ts` (entry point), `content/filter.ts` (base class), `content/facebook.ts` (implementation)

**src/options/:**
- Purpose: Extension configuration interface
- Contains: Tab-based settings interface with multiple configuration screens
- Key files: `options.tsx` (main), `intro.tsx` (welcome), `release-notes.tsx` (changelog)

**src/shared/:**
- Purpose: Shared utilities used across all layers
- Contains: Configuration, logging, domain parsing, and utility functions
- Key files: `config-handler.ts`, `logger.ts`, `get-domain.ts`

**src/models/:**
- Purpose: TypeScript type definitions for all data structures
- Contains: Complete model definitions for MBFC data with validation
- Key files: `combined-manager.ts` (all interfaces and enums)

## Key File Locations

**Entry Points:**
- `src/background/index.ts`: Background service worker entry
- `src/popup.tsx`: Popup interface
- `src/options.tsx`: Options page entry
- `src/contents/facebook.ts`: Facebook content script

**Configuration:**
- `src/shared/config-handler.ts`: Storage and configuration management
- `src/constants.ts`: Application constants

**Core Logic:**
- `src/background/sources-processor.ts`: Data fetching and caching
- `src/contents/content/filter.ts`: Base content script logic
- `src/contents/content/facebook.ts`: Facebook post detection

**Data Models:**
- `src/models/combined-manager.ts`: All MBFC data interfaces
- `src/shared/get-domain.ts`: Domain extraction utilities

## Naming Conventions

**Files:**
- TypeScript files: `.ts` for modules, `.tsx` for React components
- Component files: descriptive names with PascalCase (e.g., `Button.tsx`)
- Utility files: descriptive names with camelCase (e.g., `get-domain.ts`)
- Index files: `index.ts` for barrel exports

**Functions:**
- Async functions: descriptive names with camelCase (e.g., `getSourceData`)
- Event handlers: camelCase with clear intent (e.g., `handleTabUpdate`)
- Utility functions: camelCase with verb prefix (e.g., `getDomain`)

**Variables:**
- Constants: UPPER_SNAKE_CASE (e.g., `DEFAULT_COLLAPSE`)
- Instances: camelCase with clear type indication (e.g., `configHandler`)
- Collections: plural names (e.g., `sites_by_domain`)

**Classes:**
- PascalCase with clear purpose (e.g., `SourcesProcessor`, `ConfigHandler`)
- Singleton instances: `getInstance()` static method

## Where to Add New Code

**New Feature:**
- Popup code: `src/popup.tsx` or new component in `src/components/`
- Background functionality: `src/background/` with new message handler
- Content script feature: `src/contents/content/` with platform-specific implementation
- Utility function: `src/shared/`

**New Platform Support:**
- Content script: Create new file in `src/contents/content/` extending Filter base class
- Manifest: Update `package.json` manifest with new match patterns
- Entry point: Add new script in `src/contents/`

**New Configuration Option:**
- Type definition: Update `ConfigStorage` interface in `src/shared/config-handler.ts`
- UI component: Add to `src/options/options.tsx` or create new component
- Persistence: Automatic via existing ConfigHandler.watch() pattern

## Special Directories

**.plasmo/:**
- Purpose: Plasmo framework configuration
- Generated: Yes
- Committed: Yes

**build/:**
- Purpose: Compiled extension output
- Generated: Yes
- Committed: No (in .gitignore)

**assets/:**
- Purpose: Extension icons and static assets
- Generated: No
- Committed: Yes

**docs/:**
- Purpose: Project documentation and changelog
- Generated: No
- Committed: Yes

---

*Structure analysis: 2026-02-22*
