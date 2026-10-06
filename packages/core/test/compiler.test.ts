import { describe, expect, it } from 'vitest';

import { ts } from '../src/compiler.js';

describe('compiler', () => {
    it('resolves its own TypeScript 6 compiler API', () => {
        // TypeScript 7.0 ships no JavaScript API; see docs/decisions/0001-typescript-7.md.
        expect(ts.versionMajorMinor).toBe('6.0');
        expect(typeof ts.createProgram).toBe('function');
    });
});
