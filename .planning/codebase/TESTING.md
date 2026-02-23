# Testing Patterns

**Analysis Date:** 2026-02-22

## Test Framework

**Status:** No test framework currently configured

**Important Note:** Despite having `husky` installed for pre-commit hooks and an empty pre-commit configuration at `.husky/pre-commit`, there is no active test infrastructure in this codebase. No test files, no test runner configuration (Jest, Vitest, Mocha), and no test scripts in `package.json`.

**Package Installation:**
- `husky` (^8.0.3) - pre-commit hooks framework
- Pre-commit hook file exists at `.husky/pre-commit` but is empty/non-functional

**Run Commands (Currently unavailable):**
```bash
npm test                   # Not configured
npm run test:watch        # Not configured
npm run test:coverage     # Not configured
```

## Test Coverage Status

**Current State:** No tests exist in the codebase

**Test Files:** None found
- No `.test.ts` or `.test.tsx` files
- No `.spec.ts` or `.spec.tsx` files
- Only test infrastructure is in `node_modules` (e.g., `/node_modules/.pnpm/@pnpm+network.ca-file/ca-file.spec.ts`)

**Coverage Requirements:** Not enforced

## Code Patterns That Would Benefit From Testing

### Error Handling via neverthrow

Current code uses `Result<Type, ErrorType>` pattern extensively, which is testable:

**Example pattern from `src/shared/tab-utils.ts`:**
```typescript
export async function getTabById(tabId: number): Promise<Result<browser.Tabs.Tab, null>> {
  try {
    const tabInfo = await browser.tabs.get(tabId)
    return ok(tabInfo)
  } catch (error) {
    console.error(error)
  }
  return err(null)
}
```

**Test approach needed:**
- Mock `browser.tabs.get()` to return successful Tab object
- Mock `browser.tabs.get()` to throw error and verify `err(null)` is returned
- Verify `ok(tabInfo)` wrapping works correctly

### ConfigHandler Singleton

From `src/shared/config-handler.ts`, the ConfigHandler uses singleton pattern with async initialization:

**Current pattern:**
```typescript
export class ConfigHandler {
  private static instance: ConfigHandler

  static getInstance() {
    if (!ConfigHandler.instance) {
      ConfigHandler.instance = new ConfigHandler()
    }
    return ConfigHandler.instance
  }

  async retrieve(): Promise<ConfigStorage> {
    if (this.loaded) return this.config
    if (!this.loading) {
      this.loading = true
      this.retrievingPromise = this.loadStorage()
    }
    return this.retrievingPromise
  }
}
```

**Test approach needed:**
- Test singleton initialization (instance is reused)
- Test async loading with concurrent calls
- Mock Storage API from `@plasmohq/storage`
- Test storage watch callback triggering

### Domain Parsing Logic

From `src/shared/get-domain.ts`, URL parsing with edge cases:

**Current pattern:**
```typescript
export const getDomain = (u: string) => {
  if (!u) return { domain: "", path: "" }
  let url = u.toLowerCase()
  // ... URL normalization and parsing
  try {
    if (url.indexOf(".") > -1) {
      if (!url.startsWith("http")) url = `https://${url}`
      hn = new URL(url).hostname
      // ... domain extraction with regex
    }
  } catch (e) {
    // invalid domain is normal
  }
  return { domain: hn, path: p }
}
```

**Test approach needed:**
- Test with full URLs (http, https)
- Test with partial domains
- Test with paths and query strings
- Test invalid/malformed URLs
- Test www prefix stripping
- Test query parameter removal

### React Components

From `src/popup.tsx` and `src/components/button.tsx`:

**Current pattern:**
```typescript
function IndexPopup() {
  const [bias, setBias] = useState("")

  useEffect(() => {
    ;(async () => {
      const ct = await getCurrentTab()
      if (ct.isErr()) return
      const domain = getDomain(ct.value.url)
      const res = await sendToBackground<...>({ ... })
      // ... state updates
    })().catch((err) => {
      console.error(err)
    })
  }, [])

  return (...)
}
```

**Test approach needed:**
- Mock `getCurrentTab()` to return ok/err result
- Mock `sendToBackground()` API call
- Verify state updates happen correctly
- Test component rendering with different state values

## Recommended Testing Setup

### Framework Choice

Consider **Vitest** for modern TypeScript projects:
- Faster than Jest (based on Vite)
- Better TypeScript support
- Lower configuration overhead
- Similar API to Jest (easy migration if Jest preferred)

### Setup Files Needed

**vitest.config.ts:**
```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
})
```

**package.json scripts:**
```json
{
  "test": "vitest",
  "test:watch": "vitest --watch",
  "test:ui": "vitest --ui",
  "test:coverage": "vitest --coverage"
}
```

### Test File Organization

**Proposed structure:**
- `src/**/__tests__/` for unit tests of modules
- Example: `src/shared/__tests__/get-domain.test.ts` for `src/shared/get-domain.ts`
- Example: `src/__tests__/components/button.test.tsx` for React component tests
- Example: `src/__tests__/integration/` for integration tests

### Priority Test Targets

**High Priority (Core Logic):**
1. `src/shared/get-domain.ts` - Core URL parsing logic with multiple edge cases
2. `src/shared/config-handler.ts` - Singleton with async initialization and persistence
3. `src/background/utils/get-site-from-url.ts` - Domain matching against large dataset

**Medium Priority (API Layer):**
1. `src/popup.tsx` - Main UI component with async messaging
2. `src/shared/google-analytics.ts` - GA4 integration
3. Background message handlers in `src/background/messages/`

**Lower Priority (UI Components):**
1. Presentational components in `src/options/components/`
2. Simple utility components like `src/components/button.tsx`

### Mocking Strategy

**What to Mock:**
- Browser APIs: `chrome.tabs.get()`, `chrome.runtime.openOptionsPage()`
- External libraries: `@plasmohq/storage`, `@plasmohq/messaging`
- Network calls: `sendToBackground()` message passing
- Third-party: GA4 tracking, webextension-polyfill

**What NOT to Mock:**
- Core logic in utility functions (getDomain, domain matching)
- TypeScript/Enum definitions
- Result type handling (neverthrow library)
- Pure data transformations

### Missing Test Utilities

The codebase would benefit from:
1. Test factories for common objects (CombinedModel, ConfigStorage, SiteModel)
2. Mock implementation of `@plasmohq/storage` API
3. Test helper for Result type assertions
4. Browser API mocks (tabs, windows, runtime)

---

*Testing analysis: 2026-02-22*