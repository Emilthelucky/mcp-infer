# mcp-infer

[![CI](https://github.com/Emilthelucky/mcp-infer/actions/workflows/ci.yml/badge.svg)](https://github.com/Emilthelucky/mcp-infer/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

**Your TypeScript types are already your MCP schema.**

mcp-infer reads typed TypeScript functions and produces MCP tool definitions: the description from JSDoc and the input JSON Schema from the parameter type. It works with the official MCP TypeScript SDK and keeps runtime validation, without a schema library and without declaring anything twice.

## Before and after

With the official SDK, every tool restates its input in Zod, even when a typed function already exists:

```ts
server.registerTool(
    'create-task',
    {
        description: 'Create a task in the team tracker',
        inputSchema: z.object({
            title: z.string().describe('Short summary of the task'),
            priority: z.enum(['low', 'medium', 'high']).describe('How urgent the task is'),
            assignees: z.array(z.string()).describe('Usernames to assign the task to')
        })
    },
    createTask
);
```

With mcp-infer, the function is the definition:

```ts
/** Create a task in the team tracker */
export default async function createTask({
    title,
    priority,
    assignees
}: {
    /** Short summary of the task */
    title: string;
    /** How urgent the task is */
    priority: 'low' | 'medium' | 'high';
    /** Usernames to assign the task to */
    assignees: string[];
}) {
    // ...
}
```

```ts
import { inferTool } from '@mcp-infer/core';
import { fromJsonSchema } from '@modelcontextprotocol/server';

const { description, inputSchema } = inferTool('tools/create-task.ts');
server.registerTool('create-task', { description, inputSchema: fromJsonSchema(inputSchema) }, createTask);
```

Arguments are still validated at runtime by the SDK. An invalid `priority` comes back to the model as a tool error it can correct:

```text
Input validation error: data/priority must be equal to one of the allowed values
```

## Supported types

| TypeScript                       | JSON Schema                                |
| -------------------------------- | ------------------------------------------ |
| `string`, `number`, `boolean`    | `{ type }`                                 |
| `'a' \| 'b'`                     | `{ enum: ['a', 'b'] }`                     |
| `T[]`                            | `{ type: 'array', items }`                 |
| `{ ... }`, nested objects        | `{ type: 'object', properties, required }` |
| `x?: T`                          | omitted from `required`                    |
| other unions                     | `{ anyOf }`                                |
| JSDoc on the function / property | `description`                              |

Anything else fails loudly with an `InferError` (`UNSUPPORTED_TYPE`) instead of producing a wrong schema. More types, JSDoc constraints (`@minimum`, `@format`), output schemas, and annotations are planned; see the [roadmap](ROADMAP.md).

## Try it

The packages aren't published to npm yet. Run the example from source:

```bash
git clone https://github.com/Emilthelucky/mcp-infer.git
cd mcp-infer
pnpm install
pnpm build
pnpm --filter @mcp-infer/example-basic client
```

The client starts [`examples/basic/server.ts`](examples/basic/server.ts), which serves every file in [`examples/basic/tools`](examples/basic/tools) as an MCP tool over stdio, and sends one valid and two invalid calls.

## Design

- **Build time, not runtime.** Inference uses the TypeScript compiler API; deployed servers only need the generated schema.
- **Works with any TypeScript version in your project.** `@mcp-infer/core` brings its own TypeScript 6 compiler, because TypeScript 7 ships no compiler API yet ([ADR 0001](docs/decisions/0001-typescript-7.md)).
- **Tested on Linux, macOS, and Windows** in CI.

## Status

Early development, phase 0 of the [roadmap](ROADMAP.md). APIs will change before 1.0.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Security issues: [SECURITY.md](SECURITY.md).

## License

[MIT](LICENSE)
