import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { InferErrorCode, inferTool } from '../src/index.js';

const fixture = (name: string) => fileURLToPath(new URL(`./fixtures/${name}`, import.meta.url));

describe('inferTool', () => {
    it('infers description and input schema from types and JSDoc', () => {
        expect(inferTool(fixture('greet.ts'))).toEqual({
            description: 'Greet the user',
            inputSchema: {
                type: 'object',
                properties: {
                    name: { type: 'string', description: 'The name of the user to greet' },
                    age: { type: 'number', description: 'Age in years' },
                    tags: { type: 'array', items: { type: 'string' } },
                    mode: { enum: ['formal', 'casual'] }
                },
                required: ['name', 'tags', 'mode']
            }
        });
    });

    it('returns an empty object schema for a handler without parameters', () => {
        expect(inferTool(fixture('no-params.ts')).inputSchema).toEqual({ type: 'object', properties: {}, required: [] });
    });

    it('rejects types without a JSON Schema equivalent', () => {
        expect(() => inferTool(fixture('unsupported.ts'))).toThrow(expect.objectContaining({ code: InferErrorCode.UnsupportedType }));
    });

    it('rejects files without a default-exported function', () => {
        expect(() => inferTool(fixture('no-default.ts'))).toThrow(expect.objectContaining({ code: InferErrorCode.NoDefaultExport }));
    });

    it('rejects a non-object first parameter', () => {
        expect(() => inferTool(fixture('primitive-input.ts'))).toThrow(expect.objectContaining({ code: InferErrorCode.InvalidInput }));
    });
});
