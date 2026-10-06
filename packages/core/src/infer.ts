import { assertCompilerApi, ts } from './compiler.js';
import { InferError, InferErrorCode } from './errors.js';
import { isPlainObject, objectToJsonSchema } from './schema.js';
import type { InferredTool } from './types.js';

/**
 * Infers an MCP tool definition from a tool file's default-exported function.
 *
 * The tool description comes from the function's JSDoc, and the input schema from the type of its first parameter.
 *
 * @example
 * ```ts
 * const { description, inputSchema } = inferTool('src/tools/greet.ts');
 * ```
 *
 * @throws {InferError} when the file cannot be loaded or its types cannot be expressed as JSON Schema.
 */
export function inferTool(filePath: string): InferredTool {
    assertCompilerApi();
    const program = ts.createProgram([filePath], { strict: true, noEmit: true });
    const checker = program.getTypeChecker();

    const handler = findDefaultExport(program, checker, filePath);
    const description = ts.displayPartsToString(handler.symbol.getDocumentationComment(checker));

    const [input] = handler.declaration.parameters;
    if (!input) return { description, inputSchema: { type: 'object', properties: {}, required: [] } };

    const inputType = checker.getTypeAtLocation(input);
    if (!isPlainObject(inputType)) {
        throw new InferError(InferErrorCode.InvalidInput, `${filePath}: the handler's first parameter must be an object type`);
    }

    return { description, inputSchema: objectToJsonSchema(inputType, checker, input) };
}

function findDefaultExport(program: ts.Program, checker: ts.TypeChecker, filePath: string) {
    const source = program.getSourceFile(filePath);
    if (!source) throw new InferError(InferErrorCode.FileNotFound, `File not found: ${filePath}`);

    const moduleSymbol = checker.getSymbolAtLocation(source);
    const symbol = moduleSymbol && checker.getExportsOfModule(moduleSymbol).find(exported => exported.name === 'default');
    const declaration = symbol?.valueDeclaration;

    if (!symbol || !declaration || !ts.isFunctionLike(declaration)) {
        throw new InferError(InferErrorCode.NoDefaultExport, `${filePath}: no default-exported function`);
    }

    return { symbol, declaration };
}
