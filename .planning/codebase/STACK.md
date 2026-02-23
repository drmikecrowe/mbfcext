# Technology Stack

**Analysis Date:** 2024-02-22

## Languages

**Primary:**
- TypeScript 5.9.3 - Core language used throughout the extension
- JavaScript - For runtime functionality

**Markup:**
- JSX/TSX - React component templates in `src/**/*.tsx`
- HTML - Static extension pages

## Runtime

**Environment:**
- Node.js >=24 - Build environment and tooling

**Browser Target:**
- Chrome/Chromium (Web Extension API)
- Firefox (Web Extension API, via webextension-polyfill)
- Minimum Firefox version: 104.0 (specified in manifest)

**Package Manager:**
- pnpm (uses `pnpm-lock.yaml`)
- Lockfile: `pnpm-lock.yaml` present

## Frameworks

**Core:**
- React 18.3.1 - UI framework for components in `src/**/*.tsx`
- Plasmo 0.90.5 - Web extension framework and build tool

**Styling:**
- Tailwind CSS 3.4.1 - Utility-first CSS framework
  - Config: `tailwind.config.js`
  - PostCSS plugins for processing
  - Form plugin: `@tailwindcss/forms` 0.5.7
  - Typography plugin: `@tailwindcss/typography` 0.5.10

**Testing:**
- No testing framework configured (no Jest/Vitest config present)

**Build/Dev:**
- Plasmo 0.90.5 - Handles bundling, dev server, and packaging
  - Dev command: `plasmo dev`
  - Build command: `plasmo build`
  - Package command: `plasmo package`
- PostCSS 8.4.35 - CSS transformation
- Autoprefixer 10.4.17 - Browser compatibility for CSS

## Key Dependencies

**Critical:**
- `webextension-polyfill` 0.10.0 - Provides Firefox compatibility for Chrome WebExtension API in `src/shared/tab-utils.ts`, `src/background/utils/poller.ts`
- `@plasmohq/storage` 1.9.3 - Storage abstraction layer used throughout for extension storage (`src/shared/config-handler.ts`, `src/options/components/*.tsx`)
- `@plasmohq/messaging` 0.6.2 - Message passing between extension contexts
- `react` 18.3.1 - Core React library

**Analytics:**
- `@analytics-debugger/ga4mp` 0.0.8 - Google Analytics 4 Measurement Protocol client in `src/shared/google-analytics.ts`

**UI Components:**
- `@fortawesome/fontawesome-svg-core` 6.5.1 - Font Awesome icons base
- `@fortawesome/free-solid-svg-icons` 6.5.1 - Solid icon set
- `@fortawesome/react-fontawesome` 0.2.0 - React wrapper for Font Awesome

**Utilities:**
- `effective-domain-name-parser` 0.0.11 - Domain parsing for `src/shared/get-domain.ts`
- `lodash` 4.17.21 - Utility library
- `neverthrow` 6.1.0 - Result/Error type handling
- `debug` 4.3.4 - Debug logging utility in `src/shared/logger.ts`
- `htm` 3.1.1 - Hyperscript Tagged Markup
- `vhtml` 2.2.0 - Virtual HTML renderer
- `whatwg-fetch` 3.6.20 - Fetch API polyfill for broader compatibility

## Configuration

**Environment:**
- Configured through `@plasmohq/storage` (browser extension storage)
- Config handler: `src/shared/config-handler.ts`
- Stored in extension storage: `collapse` settings, `hiddenSites`, `unknown` sites, `mbfcBlockAnalytics`, `pollMinutes`, `lastRun`
- Google Analytics ID: G-0MYFRRVGKH (hardcoded in `src/constants.ts`)

**Build:**
- Plasmo base tsconfig: `tsconfig.json` extends `plasmo/templates/tsconfig.base`
- Path aliases: `~*` maps to `./src/*` (enables `import { foo } from "~shared"`)
- PostCSS config: `postcss.config.js` (Tailwind + Autoprefixer)
- Prettier config: `.prettierrc.cjs` with Plasmo import sort plugin
  - Print width: 180 characters
  - No semicolons
  - Double quotes
  - Trailing commas enabled

**Code Quality:**
- ESLint config: `.eslintrc.json` extends eslint recommended + React plugin + TypeScript plugin + Prettier
- TypeScript strict settings enabled
- ESLint rules: `@typescript-eslint/no-floating-promises` set to error

## Platform Requirements

**Development:**
- Node.js >=24
- pnpm package manager
- direnv for environment management (`.envrc` with devenv)

**Production:**
- Chrome/Chromium extension runtime
- Firefox extension runtime (104.0+)
- No backend server required (extension runs client-side only)

---

*Stack analysis: 2024-02-22*