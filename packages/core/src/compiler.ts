// The single entry point to the TypeScript compiler API, so a future TypeScript 7.1 backend
// only has to change this module. See docs/decisions/0001-typescript-7.md.
import ts from 'typescript';

import { InferError, InferErrorCode } from './errors.js';

export { ts };

/**
 * Fails with a clear error when the resolved `typescript` package doesn't expose the
 * compiler API (TypeScript 7.0 ships no JavaScript API).
 */
export function assertCompilerApi(): void {
    if (typeof ts?.createProgram !== 'function') {
        throw new InferError(
            InferErrorCode.CompilerUnavailable,
            `TypeScript ${ts?.version ?? '(unknown version)'} does not expose the compiler API that mcp-infer needs. ` +
                'Reinstall dependencies so @mcp-infer/core resolves its own TypeScript 6 dependency.'
        );
    }
}
