# @mcp-infer/core

Infer MCP tool definitions from TypeScript types and JSDoc.

```ts
import { inferTool } from '@mcp-infer/core';

const { description, inputSchema } = inferTool('src/tools/greet.ts');
```

`inferTool` reads the default-exported function of a tool file: its JSDoc becomes the tool description, and the type of its first parameter becomes the input JSON Schema. Unsupported types throw an `InferError` with a code.

See the [repository README](https://github.com/Emilthelucky/mcp-infer#readme) for supported types and examples.

## License

MIT
