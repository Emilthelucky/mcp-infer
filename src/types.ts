/**
 * The subset of JSON Schema emitted by {@linkcode inferTool}.
 */
export interface JsonSchema {
    type?: 'string' | 'number' | 'boolean' | 'array' | 'object';
    description?: string;
    properties?: Record<string, JsonSchema>;
    required?: string[];
    items?: JsonSchema;
    enum?: string[];
    const?: string;
    anyOf?: JsonSchema[];
}

/**
 * An object-typed {@linkcode JsonSchema}, as required for a tool's `inputSchema`.
 */
export interface ObjectJsonSchema extends JsonSchema {
    type: 'object';
    properties: Record<string, JsonSchema>;
    required: string[];
}

/**
 * The MCP tool definition inferred from a tool file.
 */
export interface InferredTool {
    description: string;
    inputSchema: ObjectJsonSchema;
}
