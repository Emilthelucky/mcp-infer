/**
 * Serves every file in `./tools` as an MCP tool, with input schemas inferred from TypeScript types.
 *
 * Schemas are inferred at startup to keep the example small; a real setup infers them at build time.
 */
import { readdirSync } from 'node:fs';
import { basename, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import type { CallToolResult } from '@modelcontextprotocol/server';
import { fromJsonSchema, McpServer } from '@modelcontextprotocol/server';
import { serveStdio } from '@modelcontextprotocol/server/stdio';

import { inferTool } from '@mcp-infer/core';

type ToolHandler = (input: unknown) => unknown;

const toolsDir = fileURLToPath(new URL('./tools', import.meta.url));

const tools = await Promise.all(
    readdirSync(toolsDir)
        .filter(file => file.endsWith('.ts'))
        .map(async file => {
            const path = join(toolsDir, file);
            const handler: ToolHandler = (await import(pathToFileURL(path).href)).default;
            return { name: basename(file, '.ts'), handler, ...inferTool(path) };
        })
);

function buildServer(): McpServer {
    const server = new McpServer({ name: 'mcp-infer-example', version: '0.0.0' });

    for (const tool of tools) {
        server.registerTool(
            tool.name,
            { description: tool.description, inputSchema: fromJsonSchema(tool.inputSchema) },
            async (input: unknown): Promise<CallToolResult> => ({
                content: [{ type: 'text', text: String(await tool.handler(input)) }]
            })
        );
    }

    return server;
}

serveStdio(buildServer);
console.error(`[server] serving ${tools.map(tool => tool.name).join(', ')} over stdio`);
