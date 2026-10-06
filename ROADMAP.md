# mcp-infer roadmap

> Your TypeScript types are already your MCP schema.

mcp-infer turns typed TypeScript functions into MCP tool definitions: input and output schemas, descriptions, constraints, annotations, and caching hints, inferred at build time from the code you already wrote. It works with the official MCP SDK, any bundler, and any framework.

This document is the plan from prototype to 1.0. Each phase ends with a tagged release and a short write-up, so progress is public and verifiable.

## Positioning

mcp-infer is not another MCP framework. It is the inference layer that frameworks and plain SDK users can share.

| | mcp-infer (goal) | xmcp | mcp-gen | typia |
| --- | --- | --- | --- | --- |
| Works with the official SDK directly | Yes | No, xmcp only | Own HTTP server | Yes, with its compiler |
| Bundler | Any (unplugin) | Rspack only | None | `ttsc` compiler |
| Input schema from types | Yes | Yes (`experimental`) | Yes | Yes |
| Output schema from return type | Yes | No | Partial | Yes |
| JSDoc constraints (`@minimum`, `@format`) | Yes | Yes | No | Yes |
| Annotations from JSDoc (`@readOnly`, `@destructive`) | Yes | No | No | No |
| Caching hints (MCP 2026-07-28) | Yes | No | No | No |
| Plain functions, no classes or decorators | Yes | Yes | Yes | No, class-based |
| Maintained | Yes | Yes | Inactive | Yes |

The table is a claim to be proven: phase 6 turns it into a reproducible comparison.

## Principles

1. **The type is the source of truth.** Nothing is declared twice.
2. **Build time, not runtime.** Deployed servers never load the TypeScript compiler.
3. **Fail loudly.** A type that can't be expressed fails the build with `file:line:col`, instead of being silently widened.
4. **Spec first.** Follow the latest MCP revision, keep earlier revisions working.
5. **Small, composable packages.** Use only what you need.
6. **Measured, not claimed.** Performance and compatibility claims come with benchmarks and tests anyone can rerun.
7. **Every OS.** CI runs on Linux, macOS, and Windows from day one.

## Target structure

```
mcp-infer/
├── packages/
│   ├── core/          @mcp-infer/core: TS types → schema IR, diagnostics (no MCP dependency)
│   ├── emit/          @mcp-infer/emit: schema IR → JSON Schema 2020-12 / Zod source
│   ├── sdk/           @mcp-infer/sdk: register inferred tools on the official MCP SDK
│   ├── cli/           @mcp-infer/cli: build, dev, check, inspect
│   ├── unplugin/      @mcp-infer/unplugin: Vite, esbuild, Rollup, Rspack, webpack
│   └── mcp-infer/     mcp-infer: convenience package re-exporting the common setup
├── examples/          runnable servers, one per feature
├── bench/             reproducible benchmarks and comparison fixtures
├── apps/docs/         documentation site
├── .changeset/        versioning and changelogs
├── .github/workflows/ CI matrix: ubuntu, macos, windows
├── AGENTS.md          rules for contributors and coding agents
├── CONTRIBUTING.md
└── ROADMAP.md
```

Tooling: pnpm workspaces, Turborepo, Changesets, Vitest, Prettier (MCP TypeScript SDK style), ESLint.

## Phases

Each phase lists what you learn, what to build, how "done" is measured, and the public output that builds reputation.

---

### Phase 0: Foundation

**Goal:** a professional repository that others can trust and contribute to.

**Learn:** monorepo tooling (pnpm workspaces, Turborepo), release automation (Changesets), cross-platform CI.

**Tasks:**
- [ ] Convert to a pnpm + Turborepo monorepo with the structure above, starting with `packages/core` and `packages/sdk`
- [ ] Move the current prototype into `packages/core` without changing behavior; keep all tests green
- [ ] CI matrix: typecheck, lint, format check, and tests on ubuntu, macos, and windows
- [ ] Changesets configured; `pnpm changeset` required for user-facing changes
- [ ] `README.md` with the one-sentence pitch, a 30-second example, and status badges
- [ ] `CONTRIBUTING.md`, `AGENTS.md`, `LICENSE` (MIT), issue and PR templates
- [ ] `docs/landscape.md`: what xmcp, mcp-gen, typia, mcp-framework, and FastMCP do, verified from their source and docs

**Done when:** a fresh clone runs `pnpm install && pnpm test` green on all three OSes in CI.

**Public output:** repository made public with a clear README and roadmap.

---

### Phase 1: Inference engine

**Goal:** the most complete and fastest TS → schema inference available.

**Learn:** TypeScript compiler API in depth (programs, type checker, symbols, flags), JSON Schema 2020-12, designing an intermediate representation.

**Tasks:**
- [ ] Schema IR: a small internal type model, independent of JSON Schema and Zod, so emitters stay simple
- [ ] One shared `ts.Program` for all tools, with incremental updates (target: < 10 ms per warm rebuild for 50 tools)
- [ ] Type coverage, each with fixtures and tests:
  - primitives, string/number/boolean literals, `enum`, literal unions → `enum`, `boolean`
  - arrays, readonly arrays, tuples
  - objects, nested objects, interfaces, type aliases, imported and re-exported types, `Pick`/`Omit`/`Partial`
  - optional vs nullable vs `undefined`
  - `Record<string, T>` and index signatures
  - `Date` → `string` with `format: date-time`
  - intersections of object types
  - discriminated unions
  - recursive types (supported via `$ref`, not rejected)
- [ ] JSDoc: descriptions, `@minimum` `@maximum` `@exclusiveMinimum` `@exclusiveMaximum` `@multipleOf` `@minLength` `@maxLength` `@pattern` `@format` `@minItems` `@maxItems` `@default` `@deprecated` `@example`
- [ ] Diagnostics: every failure has a code, `file:line:col`, the property path, and a suggested fix
- [ ] Golden tests: each fixture's expected schema is committed and reviewed

**Done when:** the type coverage table in the docs is fully green, with a test per row.

**Public output:** release `0.1.0` and a post: "What it takes to turn TypeScript types into JSON Schema."

---

### Phase 2: Emitters and output schemas

**Goal:** inference works for inputs and outputs, in the formats MCP servers use.

**Learn:** MCP `structuredContent` and `outputSchema`, Zod 3 vs Zod 4, code generation.

**Tasks:**
- [ ] `@mcp-infer/emit`: IR → JSON Schema 2020-12 (as used by MCP 2025-11-25+) and IR → Zod source (Zod 3 and 4)
- [ ] Output schema from the return type, including `Promise<T>` unwrapping
- [ ] Map returned objects to `structuredContent` with a text fallback, following the MCP tools spec
- [ ] Round-trip tests: emitted Zod and emitted JSON Schema accept and reject the same values (property-based tests with fast-check)

**Done when:** every fixture produces equivalent JSON Schema and Zod, verified by the round-trip suite.

**Public output:** release `0.2.0`.

---

### Phase 3: Official SDK integration

**Goal:** an official SDK user adds one build step and deletes all their Zod tool schemas.

**Learn:** MCP TypeScript SDK v2 internals (`registerTool`, `fromJsonSchema`, transports, era negotiation).

**Tasks:**
- [ ] Build-time manifest `.mcp/tools.json` (name, description, input/output schema, annotations, cache hints, source location)
- [ ] `@mcp-infer/sdk`: `registerTools(server, manifest, handlers)` with runtime validation through the SDK's own path; no TypeScript at runtime
- [ ] File convention (`tools/*.ts`) and explicit mode (pick exported functions) both supported
- [ ] Examples: stdio server, Streamable HTTP server, Express, Hono
- [ ] End-to-end tests over real stdio and HTTP, using raw JSON-RPC and the official client

**Done when:** the examples run in Claude Code and MCP Inspector, with validation errors returned as tool errors (SEP-1303).

**Public output:** release `0.3.0` and a demo video or GIF.

---

### Phase 4: Toolchain

**Goal:** fits into any existing project and build.

**Learn:** bundler plugin APIs (unplugin), file watching, CLI design.

**Tasks:**
- [ ] `@mcp-infer/cli`: `build`, `dev` (watch + incremental), `check` (CI mode), `inspect` (print the manifest)
- [ ] `@mcp-infer/unplugin`: Vite, esbuild, Rollup, Rspack, webpack; regenerate the manifest on type changes, including type-only imports
- [ ] Clear error overlay in dev; nonzero exit in CI

**Done when:** the same example builds with Vite, esbuild, and Rspack, with identical manifests.

**Public output:** release `0.4.0`.

---

### Phase 5: Spec-complete

**Goal:** the most complete implementation of MCP tool metadata in the ecosystem.

**Learn:** the MCP 2026-07-28 revision (caching, annotations, `resultType`), and the official conformance suite.

**Tasks:**
- [ ] Annotations from JSDoc: `@readOnly`, `@destructive`, `@idempotent`, `@openWorld` → `readOnlyHint`, `destructiveHint`, ...
- [ ] Caching hints: `@cache 1h public` → `ttlMs`, `cacheScope`, plus project defaults for `tools/list`
- [ ] Prompts and resources inference with the same conventions
- [ ] Run the relevant scenarios of `modelcontextprotocol/conformance` in CI
- [ ] Lint mode: warn about tools without descriptions or with vague parameter names, since models choose tools by these

**Done when:** conformance scenarios for tools pass, and the spec coverage table in the docs is green.

**Public output:** release `0.5.0`.

---

### Phase 6: Proof

**Goal:** every claim in this document is backed by numbers anyone can reproduce.

**Learn:** benchmarking methodology, fair comparisons.

**Tasks:**
- [ ] `bench/`: inference time (cold, warm, after a shared-type edit) for 1, 10, 50, 200 tools on all three OSes
- [ ] Comparison fixtures: the same tool set implemented with mcp-infer, xmcp (`inferToolSchemas`), mcp-gen, typia, and hand-written Zod; compare type coverage, generated schema size (tokens), build time, and setup lines
- [ ] `bench/RESULTS.md` generated by script, with machine and version details
- [ ] Coverage report; security review of generated code (escaping, regex patterns)

**Done when:** `pnpm bench` regenerates `RESULTS.md` from scratch.

**Public output:** a benchmark write-up with methodology.

---

### Phase 7: Documentation and 1.0

**Goal:** a stranger goes from zero to a running server in five minutes.

**Learn:** technical writing, developer experience.

**Tasks:**
- [ ] Docs site: quickstart, concepts, type coverage table, JSDoc reference, diagnostics reference, recipes
- [ ] Migration guides: from hand-written Zod, from the raw SDK, from xmcp
- [ ] `npx create-mcp-infer` starter
- [ ] API stability review; release `1.0.0`
- [ ] Listing in the MCP Registry and community lists

**Done when:** three people who have never seen the project complete the quickstart without help.

**Public output:** `1.0.0` launch post: "Your TypeScript types are already your MCP schema."

---

### Phase 8: Ecosystem (after 1.0)

- xmcp integration: offer mcp-infer as an engine or plugin for xmcp's inference
- Next.js and other framework adapters
- Editor support: diagnostics in VS Code through a TypeScript language service plugin
- Upstream contributions found along the way (SDK, spec examples, xmcp)

## Working rules

- Small PRs, each with tests and a changeset.
- Push work to GitHub the same day; no long-lived local branches.
- Each phase closes with a tag, a changelog, and a short write-up in `docs/journal/`.
- Commits are authored by the maintainer only.
