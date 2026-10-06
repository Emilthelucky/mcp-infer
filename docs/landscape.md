# Landscape

How TypeScript MCP tools declare their input schemas today, and where mcp-infer fits.

**Method.** Verified on 2026-10-07 from each project's source code, npm metadata, and documentation. Claims that couldn't be verified are marked as such. Versions and dates are from the npm registry.

## Summary

| Project                                                                                                 | Version (last publish) | Schemas from TS types         | Declared with                                              | Coupled to                          |
| ------------------------------------------------------------------------------------------------------- | ---------------------- | ----------------------------- | ---------------------------------------------------------- | ----------------------------------- |
| [Official SDK](https://github.com/modelcontextprotocol/typescript-sdk) (`@modelcontextprotocol/server`) | 2.3.1 (2026-10-05)     | No                            | Standard Schema (Zod, ArkType, Valibot) or raw JSON Schema | Nothing                             |
| [xmcp](https://github.com/basementstudio/xmcp)                                                          | 1.6.0 (2026-10-05)     | Yes, experimental, unreleased | Zod `schema` export, or inferred                           | xmcp framework, Rspack              |
| [FastMCP](https://github.com/punkpeye/fastmcp)                                                          | 4.22.4 (2026-10-04)    | No                            | Standard Schema (Zod, ArkType, Valibot)                    | FastMCP framework                   |
| [mcp-framework](https://github.com/QuantGeekDev/mcp-framework)                                          | 0.2.22 (2026-04-16)    | No                            | Zod 3, class-based tools                                   | mcp-framework                       |
| [typia](https://typia.io/docs/utilization/mcp/) (`@typia/mcp`)                                          | 15.1.0 (2026-10-02)    | Yes                           | Class methods                                              | typia's `ttsc` compiler             |
| [mcp-gen](https://github.com/zodromon/mcp-gen)                                                          | 1.2.0 (2026-06-15)     | Yes                           | Exported functions                                         | Its own HTTP server and CLI         |
| **mcp-infer**                                                                                           | unreleased             | Yes                           | Plain functions                                            | Official SDK, any bundler (planned) |

## Projects

### Official MCP TypeScript SDK

The reference implementation. `registerTool` takes an `inputSchema` in any [Standard Schema](https://standardschema.dev) library (Zod, ArkType, Valibot; see `examples/schema-validators` in the SDK) or raw JSON Schema through `fromJsonSchema`, and validates arguments at runtime. It has no type-based inference: a typed function's parameter type has to be restated in a schema library.

**Takeaway:** this is the integration point for mcp-infer. `fromJsonSchema` already lets inferred JSON Schema use the SDK's own validation, so mcp-infer adds no runtime of its own.

### xmcp

A framework with file-based tool discovery (`src/tools/`), hot reload, adapters, auth plugins, and deployment targets. Tools export a Zod `schema`.

Type inference landed in [basementstudio/xmcp#696](https://github.com/basementstudio/xmcp/pull/696) (merged 2026-10-06, from issue [#690](https://github.com/basementstudio/xmcp/issues/690)) behind `experimental.inferToolSchemas`. Its changeset is still pending on `main`, so it isn't in the published 1.6.0. From the source:

- An Rspack plugin generates a companion module with Zod source per tool, reusing one `ts.Program` across rebuilds (author's measurement: 50 tools in 168 ms cold, 7.4 ms warm).
- Supports objects, imported aliases and interfaces, nested objects, arrays, literals, optional and nullable fields, unions, `z.enum` for string literal unions, and JSDoc constraint tags (`@minimum`, `@maximum`, `@minLength`, `@maxLength`, `@pattern`, `@format`).
- Rejects `Date`, `Record`/index signatures, tuples, intersections, and recursive types. Inputs only; output schemas are not inferred.
- Requires `strictNullChecks`. Depends on TypeScript `^5.9.3`.

**Takeaway:** the strongest implementation today, but available only inside xmcp and its Rspack build. Its diagnostics (`file:line:col` with the property path) and shared-program design are the bar to meet.

### FastMCP

A framework built on the official SDK, with sessions, authentication, and HTTP streaming. Tool parameters use any Standard Schema library; its README states it "uses the Standard Schema specification for defining tool parameters". No type-based inference.

### mcp-framework

A framework with class-based tools, directory discovery, and a scaffolding CLI. Tool schemas are written in Zod (depends on `zod` 3.x and `typescript` `^5.3.3`). No type-based inference. Last published 2026-04-16.

### typia

A compile-time validation library. `@typia/mcp`'s `createMcpServer` turns a controller class into an MCP server: methods become tools, JSDoc becomes descriptions, and parameter and return types become input and output schemas (per its documentation). It requires typia's own TypeScript compiler wrapper (`ttsc`) in the build.

Not verified here: the full list of supported types and constraint tags.

**Takeaway:** the most mature type-to-schema engine, but class-based and tied to typia's compiler setup.

### mcp-gen

A CLI that infers tool, resource, and prompt schemas from exported functions using ts-morph and the type checker, then serves them over HTTP or generates schemas. Its listing on Glama marks it as inactive, and the last npm publish was 2026-06-15.

**Takeaway:** the closest idea to mcp-infer, but it owns the server instead of integrating with the SDK.

## Where mcp-infer fits

Every project above either needs a schema library to restate types (official SDK, FastMCP, mcp-framework, xmcp without the flag), or ties inference to its own framework or compiler (xmcp, typia, mcp-gen).

The gap mcp-infer targets: **type-based inference for code that uses the official SDK directly, with any bundler, using plain functions.** The plan to close it, and to go further with output schemas, annotations, and caching hints, is in the [roadmap](../ROADMAP.md).

Risks to track:

- xmcp's inference will be released soon and may become the default way to write xmcp tools.
- typia already covers inputs and outputs for class-based code.
- The official SDK could add inference itself; contributing upstream would then be the better path.

Phase 6 turns this document's claims into reproducible benchmarks and comparison fixtures.
