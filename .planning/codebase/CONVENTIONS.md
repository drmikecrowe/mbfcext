# Coding Conventions

**Analysis Date:** 2026-02-20

## Naming Patterns

**Files:**
- PascalCase for React components: `Button.tsx`, `Config.tsx`, `IndexPopup.tsx`
- camelCase for utility and service files: `get-domain.ts`, `config-handler.ts`, `logger.ts`
- kebab-case for component directories: `tab-groups.tsx`, `tab-contents.tsx`
- Index files for barrel exports: `src/shared/index.ts`, `src/models/index.ts`

**Functions:**
- camelCase for all functions: `getDomain()`, `isDevMode()`, `getCurrentTab()`, `checkDomain()`
- Static class methods use camelCase: `ConfigHandler.getInstance()`, `GoogleAnalytics.getInstance()`
- Async functions explicitly marked with `async` keyword

**Variables:**
- camelCase for all variable declarations: `sourceData`, `configDefaults`, `ct`, `ldomain`
- Const declarations for immutable values: `export const GA = "..."`
- Destructured imports from relative paths use tilde alias: `import { getDomain } from "~shared"`

**Types:**
- PascalCase for interfaces and types: `BiasModel`, `ConfigStorage`, `PopupDetails`, `Collapse`
- PascalCase for enum names: `BiasEnums`, `CollapseKeys`, `CredibilityEnums`
- Suffixes used: `*Model` for data models, `*Handler` for service classes, `*Codes` for code enums
- Interface properties use camelCase: `biasDescription`, `mbfcLink`, `hiddenSites`

## Code Style

**Formatting:**
- Prettier configured with `printWidth: 180` - allow long lines
- `tabWidth: 2` - 2-space indentation
- `useTabs: false` - spaces only
- `semi: false` - no semicolons in most cases
- `singleQuote: false` - double quotes preferred
- `trailingComma: "all"` - trailing commas for multiline
- `bracketSpacing: true` - spaces in object literals
- `bracketSameLine: true` - closing bracket on same line

**Linting:**
- ESLint with TypeScript support via `@typescript-eslint/parser`
- Key rule: `@typescript-eslint/no-floating-promises: "error"` - must await all promises
- Rule: `react/react-in-jsx-scope: 0` - React 18 doesn't require React import in scope
- Rule: `@typescript-eslint/no-explicit-any: 0` - `any` type is allowed (used in several places)
- Ignores: `src/utils/combinedModel.ts` and all `.js` files

**Pre-commit hooks:**
- Husky configured via `.husky/pre-commit` but hook content is empty/minimal

## Import Organization

**Order:**
1. External library imports (e.g., `import React`, `import { m } from "malevic"`)
2. Type imports from external libraries: `import type { ... } from "@types/..."`
3. Plasmohq imports: `import { Storage } from "@plasmohq/storage"`
4. Internal imports using tilde alias: `import { getDomain } from "~shared"`
5. Relative imports (less common): `import { logger } from "../../shared/logger"`
6. Side-effect imports (CSS, config): `import "./style.css"`

**Path Aliases:**
- Single tilde prefix: `~` maps to `./src/` (configured in `tsconfig.json`)
- Example: `import { logger } from "~shared"` resolves to `src/shared/logger.ts`
- Also used for nested paths: `import { GET_DOMAIN_FOR_TAB } from "~background/messages"`

**Comments:**
- Use relative paths for imports within same directory: `import Tab from "./tab"`
- ESLint ignore comments for specific rules: `// eslint-disable-next-line prefer-destructuring`
- Explain non-obvious code: `// hack until I can get it to work` in `src/shared/logger.ts`

## Error Handling

**Patterns:**
- Use `neverthrow` Result type for explicit error handling: `Result<Type, null>` or `Result<Type, Error>`
- Functions return `ok(value)` or `err(null)` explicitly
- Check results before accessing: `if (ct.isErr()) return` or `if (cdr.isOk() && cdr.value.site)`
- Try-catch for browser APIs that throw: `try { ... } catch (e) { console.error(e) }`
- Empty catch blocks with `// ignore` comments indicate expected/handled exceptions

**Error Reporting:**
- Console.error for critical errors in catch blocks
- Logger instance for development/debugging: `const log = logger("mbfc:popup")`
- Logger returns `console.log` in dev mode as a temporary workaround
- Async operations chain `.catch((err) => console.error(err))` for error capture

## Logging

**Framework:** Custom logger wrapper around `debug` package

**Patterns:**
- Initialize at module level: `const log = logger("mbfc:popup")`
- Namespace format: `"mbfc:<module>:<feature>"` (e.g., `"mbfc:background:index"`)
- Call logger like function: `log("message", value)` or `log("Key changed, updating to", newValue)`
- Development mode check: `isDevMode()` determines if debug package is active
- Debug namespace set in storage: `"debug"` key set to `"mbfc:*"` to enable all namespaces

## Comments

**When to Comment:**
- Explain "why" not "what" - code should be self-documenting
- Comment unusual logic: `// invalid domain is normal` in `get-domain.ts`
- Comment generated code: `// To parse this data:` headers in model files
- Flag incomplete features: `// TODO: tw_path` in `get-site-from-url.ts`
- Explain workarounds: `// hack until I can get it to work` for logger implementation

**JSDoc/TSDoc:**
- Used for interface/type documentation: `/** The domain name */` on properties
- Used for model classes: Comments above class and method definitions
- Brief descriptions preferred - one-liner format for interface properties

## Function Design

**Size:** Typically 15-50 lines

**Parameters:**
- Destructured object parameters for components: `({ handler }, ...children)`
- Individual parameters for utility functions: `getDomain(u: string)`
- Type annotations always included: `getTabById(tabId: number)`

**Return Values:**
- Explicit types required: `Promise<Result<Type, ErrorType>>`
- Single responsibility: Each function returns one type
- Early returns for error cases

## Module Design

**Exports:**
- Named exports for utilities: `export const getDomain = (...) => {...}`
- Default exports for React components: `export default function Button(...) { ... }`
- Named exports for classes: `export class ConfigHandler { ... }`
- Type exports with `type` keyword: `export type HiddenSites = Record<string, boolean>`

**Barrel Files:**
- `src/shared/index.ts` exports: config-handler, get-domain, logger, tab-utils
- `src/models/index.ts` exports: combined-manager
- `src/options/components/index.ts` exports: Icons, Tab, TabContent, Tabs, TabGroups
- Allow wildcard exports: `export * from './config-handler'`

**Singletons:**
- ConfigHandler uses singleton pattern: `static getInstance()` returns cached instance
- GoogleAnalytics uses same singleton pattern
- Instance checked before creation: `if (!ConfigHandler.instance) { ... }`

---

*Convention analysis: 2026-02-20*
