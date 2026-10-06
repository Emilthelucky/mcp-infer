# Agent guidance: mcp-infer

This is the instruction set for coding agents and human contributors. If a rule here conflicts with a tool's default behavior, this file wins.

## Project

mcp-infer infers MCP tool definitions (input and output schemas, descriptions, constraints, annotations, caching hints) from typed TypeScript functions at build time. It works with the official MCP TypeScript SDK and any bundler. See `ROADMAP.md` for the plan and current phase.

## Repository basics

- Node 20 or later, pnpm (version pinned in `packageManager`). TypeScript strict mode.
- pnpm + Turborepo monorepo:
    - `packages/core`: `@mcp-infer/core`, the inference engine (`src/`, tests and fixtures in `test/`)
    - `examples/*`: private, runnable example servers
- Shared compiler options live in `tsconfig.base.json`; each package extends it.

## Commands

```bash
pnpm install
pnpm build          # turbo: build all packages
pnpm typecheck
pnpm test
pnpm format:check
pnpm --filter @mcp-infer/example-basic client   # end-to-end example
```

Run `pnpm build`, `pnpm typecheck`, `pnpm test`, and `pnpm format:check` before handing work back.

## Design rules

- **The type is the source of truth.** Never ask users to declare the same information twice.
- **Build time only.** Code that ships to a deployed server must not import `typescript`.
- **Fail loudly.** If a type has no faithful JSON Schema equivalent, throw an `InferError` with a code and location. Never widen to `any` or drop a constraint silently.
- **Spec first.** Follow the latest MCP specification revision; keep behavior for earlier revisions working. Cite the spec section in the PR when behavior depends on it.
- **Cross-platform.** Never assume `/` in paths. Normalize with `path.sep` or compare in TypeScript's forward-slash form, and keep CI green on Windows.
- Prefer existing helpers over new abstractions. Do not add dependencies without a clear reason in the PR.

## Code style

- Formatting follows `.prettierrc.json` (4 spaces, single quotes, 140 columns), matching the MCP TypeScript SDK.
- JSDoc on public API only. Inline comments are one line and explain why, not what.
- No debug logging, no `console.log` in library code. Servers using stdio must write diagnostics to stderr.
- Errors use `InferError` with an `InferErrorCode`.

## Tests

- Every behavior change comes with a test that fails without it.
- Inference tests use fixture files in `test/fixtures/`, one concept per fixture.
- Prefer end-to-end checks (a real MCP request and response) for user-visible behavior.

## Commits and pull requests

- Commits are authored by the maintainer only.
- **Never add AI attribution**: no `Co-Authored-By: Claude`, no `Generated with Claude Code`, no equivalent lines for any other AI tool, in commits or PR descriptions. The `commit-msg` hook in `.githooks/` rejects them.
- Commit messages: imperative subject under 72 characters, Conventional Commits style (`feat:`, `fix:`, `test:`, `docs:`, `chore:`), and a body explaining why when it isn't obvious.
- Keep PRs focused on one change. Leave unrelated cleanups for a follow-up.
- Push work the same day it is ready; avoid long-lived local branches.
- Do not push, open PRs, or publish packages unless the maintainer asks.

## Tooling versions

Tool behavior can differ from what an agent remembers. Before changing Turborepo, pnpm, or Changesets configuration, check the installed version and its bundled docs (for Turborepo: `node_modules/turbo/docs/`). Turborepo's automatic `AGENTS.md` block is disabled with `"agentGuidance": false` in `turbo.json`; this file is maintained by hand.
