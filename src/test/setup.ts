import { vi } from "vitest"

// Mock Chrome APIs for extension testing
const chromeMock = {
  runtime: {
    getURL: vi.fn((path: string) => `chrome-extension://test/${path}`),
    getManifest: vi.fn(() => ({ version: "1.0.0", name: "Test Extension" })),
    openOptionsPage: vi.fn(),
    sendMessage: vi.fn(),
    onMessage: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
    },
  },
  storage: {
    local: {
      get: vi.fn().mockResolvedValue({}),
      set: vi.fn().mockResolvedValue(undefined),
      remove: vi.fn().mockResolvedValue(undefined),
      clear: vi.fn().mockResolvedValue(undefined),
      onChanged: {
        addListener: vi.fn(),
        removeListener: vi.fn(),
      },
    },
    sync: {
      get: vi.fn().mockResolvedValue({}),
      set: vi.fn().mockResolvedValue(undefined),
      remove: vi.fn().mockResolvedValue(undefined),
      clear: vi.fn().mockResolvedValue(undefined),
    },
  },
  tabs: {
    query: vi.fn().mockResolvedValue([]),
    getCurrent: vi.fn().mockResolvedValue(null),
    sendMessage: vi.fn(),
  },
}

// Assign to global
;(globalThis as any).chrome = chromeMock

// Mock process.env for tests
vi.stubEnv("NODE_ENV", "test")
