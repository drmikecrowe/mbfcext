# Agent Instructions

This project uses **bd** (beads) for issue tracking. Run `bd onboard` to get started.

## Quick Reference

```bash
bd ready              # Find available work
bd show <id>          # View issue details
bd update <id> --status in_progress  # Claim work
bd close <id>         # Complete work
bd sync               # Sync with git
```

## Package Manager

**CRITICAL:** Always use **pnpm**, never npm or yarn.

```bash
pnpm add <package>        # Add dependency
pnpm add -D <package>     # Add dev dependency
pnpm install              # Install all dependencies
```

## Project Stack

- **TypeScript 5.9.3** with strict mode
- **React 18.3.1** for UI components
- **Plasmo 0.90.5** for browser extension build
- **Tailwind CSS 3.4.1** for styling
- **pnpm** for package management
- **Node.js >=24** required

## Code Conventions

- **Path aliases:** `~` maps to `./src/` (e.g., `import { foo } from "~shared"`)
- **Error handling:** Use `neverthrow` Result types (`ok()`/`err()`)
- **Naming:** camelCase for functions/variables, PascalCase for types/components
- **Formatting:** Prettier with 180 print width, no semicolons, double quotes

## Testing

- Test framework: **Vitest** with jsdom environment
- Run: `pnpm test` or `pnpm test:watch`
- Test files: `*.test.ts` or `*.spec.ts` alongside source or in `__tests__/`

## Landing the Plane (Session Completion)

**When ending a work session**, you MUST complete ALL steps below. Work is NOT complete until `git push` succeeds.

**MANDATORY WORKFLOW:**

1. **File issues for remaining work** - Create issues for anything that needs follow-up
2. **Run quality gates** (if code changed) - Tests, linters, builds
3. **Update issue status** - Close finished work, update in-progress items
4. **PUSH TO REMOTE** - This is MANDATORY:
   ```bash
   git pull --rebase
   bd sync
   git push
   git status  # MUST show "up to date with origin"
   ```
5. **Clean up** - Clear stashes, prune remote branches
6. **Verify** - All changes committed AND pushed
7. **Hand off** - Provide context for next session

**CRITICAL RULES:**
- Work is NOT complete until `git push` succeeds
- NEVER stop before pushing - that leaves work stranded locally
- NEVER say "ready to push when you are" - YOU must push
- If push fails, resolve and retry until it succeeds

