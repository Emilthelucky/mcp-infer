# 0001: Depend on TypeScript 6 until the TypeScript 7.1 API is stable

- **Status:** Accepted
- **Date:** 2026-10-07

## Context

`@mcp-infer/core` reads types through the TypeScript compiler API (`ts.createProgram`, the type checker, symbols, and JSDoc helpers).

TypeScript 7.0 (released 2026-07-08) is the native compiler rewritten in Go. Its announcement states that "TypeScript 7.0 does not ship with an API" and that 7.1 is expected "to ship with a new (and different) API". Verified locally: `typescript@7.0.2` exports only `version` and `versionMajorMinor`, and `@mcp-infer/core` failed with `ts.createProgram is not a function`. The same code works unchanged with `typescript@6.0.3`.

Until this decision, `@mcp-infer/core` declared `typescript` as a peer dependency `>=5.0`, which accepted TypeScript 7 and crashed at runtime.

How comparable projects declare TypeScript (npm, 2026-10-07):

| Project                                 | Declaration                  |
| --------------------------------------- | ---------------------------- |
| xmcp compiler (schema inference)        | dependency `^5.9.3`          |
| ts-json-schema-generator                | dependency `^5.9.3`          |
| typescript-json-schema                  | dependency `~5.9.3`          |
| typescript-eslint (`typescript-estree`) | peer `>=4.8.4 <6.1.0`        |
| ts-jest                                 | peer `>=4.3 <7`              |
| Angular compiler CLI                    | peer `>=6.0 <6.1`            |
| ts-morph                                | ships its own copy           |
| vue-tsc                                 | peer `>=5.0.0` (accepts 7.0) |

Language tools such as linters need the user's own compiler, so they use bounded peer ranges. Schema generators only need to read types at build time, so they bring their own TypeScript.

## Decision

- `@mcp-infer/core` depends on `typescript` `~6.0.3` as a regular dependency, independent of the TypeScript version the user's project uses. The tilde range allows patches only, because TypeScript minors can change the compiler API.
- All compiler access goes through `packages/core/src/compiler.ts`, which also fails with `InferError` code `COMPILER_UNAVAILABLE` and an actionable message if the compiler API is missing.
- Dependabot ignores major TypeScript upgrades; moving to the 7.x API is a deliberate migration.

## Consequences

- Works in projects on TypeScript 5, 6, or 7, since the user's `tsc` is not involved in inference.
- Adds TypeScript 6 to the install footprint of `@mcp-infer/core` (build time only; deployed servers don't load it).
- Syntax introduced after TypeScript 6.0 can't be read until the backend is upgraded.
- When TypeScript 7.1 ships a stable API, add a backend for it behind `compiler.ts` and measure it against TypeScript 6 (tracked in ROADMAP phase 1).
