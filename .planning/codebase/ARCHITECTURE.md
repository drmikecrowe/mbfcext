# Architecture

**Analysis Date:** 2026-02-22

## Pattern Overview

**Overall:** Extension Architecture with Content Script Integration

**Key Characteristics:**
- Browser extension architecture using Plasmo framework
- Content script injection for Facebook page modification
- Background service worker for data management and messaging
- Popup interface for quick information display
- Options page for configuration management

## Layers

**Background Layer:**
- Purpose: Service worker handling data fetching, icon updates, and inter-process messaging
- Location: `src/background/`
- Contains: Background service, message handlers, data source processing
- Depends on: Storage API, Chrome extension APIs, shared utilities
- Used by: Popup, content scripts, extension lifecycle

**Content Script Layer:**
- Purpose: DOM manipulation and filtering on target websites
- Location: `src/contents/`
- Contains: Content scripts, DOM filters, post detection logic
- Depends on: Background messages, shared utilities, browser APIs
- Used by: Facebook page for post detection and bias indicators

**UI Layer:**
- Purpose: User interface components and pages
- Location: `src/popup.tsx`, `src/options/`
- Contains: Popup display, options configuration, components
- Depends on: React, Plasmo messaging, shared utilities
- Used by: End users, extension users

**Data Layer:**
- Purpose: Data models, configuration handling, and data management
- Location: `src/models/`, `src/shared/`
- Contains: TypeScript interfaces, data models, configuration storage
- Depends on: Storage API, JSON parsing, utilities
- Used by: All layers for data consistency

## Data Flow

**Popup Initialization:**

1. User opens popup → `popup.tsx` loads
2. `getCurrentTab()` → Gets current tab information
3. `getDomain()` → Extracts domain from URL
4. `sendToBackground()` → Requests domain data from background
5. Background receives request → Queries source data and configuration
6. Returns bias information → Popup displays rating and link

**Content Script Processing:**

1. Content script loads → `facebook.ts` entry point
2. `ConfigHandler.getInstance()` → Loads user preferences
3. `Facebook.getInstance()` → Initializes post detection
4. MutationObserver watches DOM → Detects new posts
5. `findArticleElements()` → Identifies post containers
6. `findTitleElement()` → Extracts domain/link information
7. `sendToBackground()` → Requests bias information
8. Posts filtered/blocked based on configuration
9. Bias indicators added to posts

**Configuration Management:**

1. User changes preferences → Options page updates
2. `ConfigHandler.getInstance().persist()` → Saves to storage
3. `Storage.watch()` → Listens for changes
4. Updates propagate to background and content scripts
5. Content scripts adapt filtering behavior immediately

## Key Abstractions

**Filter Abstraction:**
- Purpose: Base class for content script filtering logic
- Examples: `src/contents/content/filter.ts`
- Pattern: Template method pattern with platform-specific implementations

**ConfigHandler Abstraction:**
- Purpose: Centralized configuration management with storage synchronization
- Examples: `src/shared/config-handler.ts`
- Pattern: Singleton with reactive storage watching

**CombinedModel Abstraction:**
- Purpose: TypeScript interfaces for all MBFC data structures
- Examples: `src/models/combined-manager.ts`
- Pattern: Data model with validation and conversion utilities

**Message Passing Abstraction:**
- Purpose: Typed inter-process communication
- Examples: `src/background/messages/`
- Pattern: Plasmo messaging with request/response types

## Entry Points

**Background Service:**
- Location: `src/background/index.ts`
- Triggers: Extension installation, tab updates, window focus
- Responsibilities: Data initialization, icon updates, event listeners

**Popup Interface:**
- Location: `src/popup.tsx`
- Triggers: User clicking extension icon
- Responsibilities: Display bias information, navigate to options

**Content Script:**
- Location: `src/contents/facebook.ts`
- Triggers: Navigation to Facebook domains
- Responsibilities: Detect posts, apply filtering, show bias indicators

**Options Page:**
- Location: `src/options/options.tsx`
- Triggers: User opening options
- Responsibilities: Configure extension behavior, preferences

## Error Handling

**Strategy:** Result-based error handling with neverthrow

**Patterns:**
- `Result<T, E>` for async operations
- Early returns with `if (isErr())`
- Logging for debugging purposes
- Graceful degradation when data unavailable

## Cross-Cutting Concerns

**Logging:**
- Framework: Debug library with structured logging
- Patterns: Module-specific loggers with prefixing
- Levels: Info for events, error for failures

**Storage:**
- Framework: Plasmo Storage API
- Patterns: Watch for changes, singleton instances
- Data types: JSON serialization for complex objects

**DOM Manipulation:**
- Framework: Native DOM APIs with TypeScript types
- Patterns: MutationObserver for reactive updates
- Safety: Class markers to prevent duplicate processing

**Messaging:**
- Framework: Plasmo @plasmohq/messaging
- Patterns: Typed request/response objects
- Flow: Bidirectional between background and content scripts

---

*Architecture analysis: 2026-02-22*
