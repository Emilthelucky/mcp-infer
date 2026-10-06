# Security policy

## Reporting a vulnerability

Please do not report security issues in public issues or pull requests.

Report them privately through [GitHub security advisories](https://github.com/Emilthelucky/mcp-infer/security/advisories/new). Include a description, the affected version, and steps to reproduce. You can expect an initial response within a few days.

## Scope

mcp-infer runs at build time and generates schemas and code that validate MCP tool inputs at runtime. Issues of particular interest:

- Generated schemas that accept inputs the source types forbid
- Unescaped user-controlled text (JSDoc, property names, patterns) in generated code
- Anything that loads the TypeScript compiler or source files in a deployed server
