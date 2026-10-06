/**
 * Calls the example server with raw JSON-RPC over stdio, bypassing client-side validation,
 * to show that the server rejects arguments that don't match the inferred schema.
 */
import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';
import { fileURLToPath } from 'node:url';

const calls = [
    { title: 'Write docs', priority: 'high', assignees: ['emil'], due: { day: 1, month: 1 } },
    { title: 'Write docs', priority: 'urgent', assignees: ['emil'] },
    { title: 'Write docs', due: { day: 1, month: 1 } }
];

const server = spawn('npx tsx server.ts', {
    cwd: fileURLToPath(new URL('.', import.meta.url)),
    shell: true,
    stdio: ['pipe', 'pipe', 'inherit']
});
const pending = new Set(calls.map((_, index) => index + 1));

function send(message: object): void {
    console.log('►', JSON.stringify(message));
    server.stdin.write(JSON.stringify(message) + '\n');
}

createInterface({ input: server.stdout }).on('line', line => {
    console.log('◄', line);
    const { id } = JSON.parse(line);

    if (id === 0) {
        send({ jsonrpc: '2.0', method: 'notifications/initialized' });
        calls.forEach((args, index) => {
            send({ jsonrpc: '2.0', id: index + 1, method: 'tools/call', params: { name: 'create-task', arguments: args } });
        });
    }
    // Responses can arrive in any order, so wait for every id rather than the last one sent.
    pending.delete(id);
    if (pending.size === 0) server.kill();
});

send({
    jsonrpc: '2.0',
    id: 0,
    method: 'initialize',
    params: { protocolVersion: '2025-11-25', capabilities: {}, clientInfo: { name: 'example-client', version: '0.0.0' } }
});
