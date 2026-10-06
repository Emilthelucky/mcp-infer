# Phase 0: Foundation

**Closed:** 2026-10-07

## Goal

A repository others can trust and contribute to, before any new inference features.

## What changed

- **Monorepo.** pnpm workspaces, Turborepo, and Changesets. The prototype moved to `packages/core` (`@mcp-infer/core`) with `git mv`, so its history is kept; the example became `examples/basic`.
- **CI on three operating systems.** Format, lint, build, typecheck, and tests on ubuntu, macOS, and Windows; a full run takes about a minute.
- **Repository standards.** License, contributing guide, security policy, code of conduct, issue and PR templates, CODEOWNERS, Dependabot, `.nvmrc`, and agent guidance in `AGENTS.md`.
- **Commit hygiene.** A `commit-msg` hook rejects AI attribution lines; `.gitattributes` normalizes line endings to LF so the hook and Prettier behave the same on every OS.
- **TypeScript 7 decision.** TypeScript 7.0 ships no compiler API. `@mcp-infer/core` now depends on TypeScript 6 and routes all compiler access through one module ([ADR 0001](../decisions/0001-typescript-7.md)).
- **Landscape.** A verified comparison of the official SDK, xmcp, FastMCP, mcp-framework, typia, and mcp-gen ([landscape.md](../landscape.md)).

## Numbers

- 6 tests, 17 linted files, 0 lint issues
- CI: 3 of 3 operating systems green

## Lessons

- **Verify before claiming.** The first roadmap table listed competitor features that later couldn't be confirmed; they're now marked "not verified" until phase 6 measures them.
- **Major upgrades are migrations.** Dependabot's grouped upgrade to TypeScript 7 failed CI. Major bumps of the compiler and test stack are now held for deliberate migration.
- **Invisible bytes matter.** CRLF line endings on Windows break shell hooks and trip formatters; normalizing in `.gitattributes` prevents both.
- **Tools write into your repo.** Turborepo appended its own block to `AGENTS.md` when it detected an agent; it's disabled with `agentGuidance: false` so the file stays hand-maintained.

## Next

[Phase 1](../../ROADMAP.md#phase-1-inference-engine): the inference engine. A schema IR, one shared `ts.Program`, broader type coverage, JSDoc constraint tags, and diagnostics with locations.
