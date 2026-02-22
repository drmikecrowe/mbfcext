import { defineConfig } from "vitest/config"
import { resolve } from "path"

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    include: ["src/**/*.test.ts", "src/**/*.spec.ts"],
    exclude: ["node_modules", ".plasmo"],
    testTimeout: 10000,
  },
  resolve: {
    alias: [
      {
        find: /^~(.*)$/,
        replacement: resolve(__dirname, "src/$1"),
      },
    ],
  },
})
