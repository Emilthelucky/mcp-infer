import { ts } from './compiler.js';
import { InferError, InferErrorCode } from './errors.js';
import type { JsonSchema, ObjectJsonSchema } from './types.js';

/**
 * Converts a TypeScript type into JSON Schema.
 *
 * @throws {InferError} with {@linkcode InferErrorCode.UnsupportedType} for types without a JSON Schema equivalent.
 */
export function typeToJsonSchema(type: ts.Type, checker: ts.TypeChecker, location: ts.Node): JsonSchema {
    if (type.flags & ts.TypeFlags.String) return { type: 'string' };
    if (type.flags & ts.TypeFlags.Number) return { type: 'number' };
    if (type.flags & ts.TypeFlags.Boolean) return { type: 'boolean' };
    if (type.isStringLiteral()) return { const: type.value };
    if (type.isUnion()) return unionToJsonSchema(type, checker, location);
    if (checker.isArrayType(type)) return arrayToJsonSchema(type as ts.TypeReference, checker, location);
    if (isPlainObject(type)) return objectToJsonSchema(type, checker, location);

    throw new InferError(InferErrorCode.UnsupportedType, `Unsupported type: ${checker.typeToString(type)}`);
}

/**
 * Converts an object type into JSON Schema, reading property descriptions from JSDoc.
 */
export function objectToJsonSchema(type: ts.Type, checker: ts.TypeChecker, location: ts.Node): ObjectJsonSchema {
    const properties: Record<string, JsonSchema> = {};
    const required: string[] = [];

    for (const property of checker.getPropertiesOfType(type)) {
        const schema = typeToJsonSchema(checker.getTypeOfSymbolAtLocation(property, location), checker, location);
        const description = ts.displayPartsToString(property.getDocumentationComment(checker));
        if (description) schema.description = description;

        properties[property.name] = schema;
        if (!(property.flags & ts.SymbolFlags.Optional)) required.push(property.name);
    }

    return { type: 'object', properties, required };
}

export function isPlainObject(type: ts.Type): boolean {
    return (type.flags & ts.TypeFlags.Object) !== 0 && type.getCallSignatures().length === 0;
}

function unionToJsonSchema(type: ts.UnionType, checker: ts.TypeChecker, location: ts.Node): JsonSchema {
    // `undefined` comes from optional properties, which are expressed through `required` instead.
    const members = type.types.filter(member => !(member.flags & ts.TypeFlags.Undefined));

    if (members.every(member => member.isStringLiteral())) {
        return { enum: members.map(member => (member as ts.StringLiteralType).value) };
    }
    if (members.length === 1) return typeToJsonSchema(members[0], checker, location);

    return { anyOf: members.map(member => typeToJsonSchema(member, checker, location)) };
}

function arrayToJsonSchema(type: ts.TypeReference, checker: ts.TypeChecker, location: ts.Node): JsonSchema {
    const [item] = checker.getTypeArguments(type);
    return { type: 'array', items: typeToJsonSchema(item, checker, location) };
}
