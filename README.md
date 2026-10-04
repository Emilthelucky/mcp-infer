# mcp-infer

Infer MCP tool input schemas from TypeScript types and JSDoc, without a schema library.

```ts
/** Greet the user */
export default async function greet({ name }: {
    /** The name of the user to greet */
    name: string;
}) {
    return `Hello, ${name}!`;
}
```

```ts
import { inferTool } from 'mcp-infer';

inferTool('src/tools/greet.ts');
// {
//     description: 'Greet the user',
//     inputSchema: {
//         type: 'object',
//         properties: { name: { type: 'string', description: 'The name of the user to greet' } },
//         required: ['name']
//     }
// }
```

The result plugs into the official SDK through `fromJsonSchema`, so arguments are still validated at runtime:

```ts
const { description, inputSchema } = inferTool(path);
server.registerTool(name, { description, inputSchema: fromJsonSchema(inputSchema) }, handler);
```

## Supported types

| TypeScript                | JSON Schema                                     |
| ------------------------- | ----------------------------------------------- |
| `string`, `number`, `boolean` | `{ type }`                                  |
| `'a' \| 'b'`              | `{ enum: ['a', 'b'] }`                          |
| `T[]`                     | `{ type: 'array', items }`                      |
| `{ ... }`                 | `{ type: 'object', properties, required }`      |
| `x?: T`                   | omitted from `required`                         |
| other unions              | `{ anyOf }`                                     |

Anything else throws an `InferError` with code `UNSUPPORTED_TYPE`.

## Examples

```bash
npm run example:client
```

Starts [`examples/server.ts`](examples/server.ts), which serves every file in [`examples/tools`](examples/tools) as a tool, and sends it one valid and two invalid calls.

## Status

Early prototype.
