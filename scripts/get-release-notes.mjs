/**
 * Extracts release notes for the current version from src/options/release-notes.ts
 * and prints them as markdown. Used by the CI release workflow.
 */
import { readFileSync } from "fs"

const pkg = JSON.parse(readFileSync("./package.json", "utf8"))
const majorMinor = pkg.version.split(".").slice(0, 2).join(".")

const source = readFileSync("./src/options/release-notes.ts", "utf8")

const sectionPattern = new RegExp(
  `title:\\s*"Release notes for version ${majorMinor.replace(".", "\\.")}"[\\s\\S]*?items:\\s*\\[([\\s\\S]*?)\\]`,
)
const match = sectionPattern.exec(source)
if (!match) {
  console.error(`No release notes found for version ${majorMinor}`)
  process.exit(1)
}

const items = []
const itemPattern = /"((?:[^"\\]|\\.)*)"/g
let m
while ((m = itemPattern.exec(match[1])) !== null) {
  items.push(m[1])
}

console.log(`## What's New in ${majorMinor}\n`)
items.forEach((item) => console.log(`- ${item}`))
