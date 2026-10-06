---
'@mcp-infer/core': minor
---

Depend on TypeScript 6 directly instead of a `>=5.0` peer, so inference works in projects on TypeScript 7, which ships no compiler API. A missing compiler API now fails with `InferError` code `COMPILER_UNAVAILABLE` instead of `ts.createProgram is not a function`.
