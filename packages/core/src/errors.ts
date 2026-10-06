/**
 * Error codes for failures while inferring a tool definition.
 */
export enum InferErrorCode {
    /** The tool file could not be loaded */
    FileNotFound = 'FILE_NOT_FOUND',
    /** The tool file has no default-exported function */
    NoDefaultExport = 'NO_DEFAULT_EXPORT',
    /** The handler's first parameter is not an object type */
    InvalidInput = 'INVALID_INPUT',
    /** A type has no JSON Schema equivalent */
    UnsupportedType = 'UNSUPPORTED_TYPE'
}

/**
 * Thrown when a tool definition cannot be inferred.
 */
export class InferError extends Error {
    constructor(
        public readonly code: InferErrorCode,
        message: string
    ) {
        super(message);
        this.name = 'InferError';
    }
}
