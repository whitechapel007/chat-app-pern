export declare class AppError extends Error {
    statusCode: number;
    isOperational: boolean;
    constructor(message: string, statusCode: number);
}
export declare class ValidationError extends AppError {
    constructor(message: string);
}
export declare class AuthenticationError extends AppError {
    constructor(message?: string);
}
export declare class AuthorizationError extends AppError {
    constructor(message?: string);
}
export declare class NotFoundError extends AppError {
    constructor(message?: string);
}
export declare class ConflictError extends AppError {
    constructor(message?: string);
}
export declare class RateLimitError extends AppError {
    constructor(message?: string);
}
export declare class InternalServerError extends AppError {
    constructor(message?: string);
}
export declare const formatErrorResponse: (error: AppError | Error) => {
    success: boolean;
    error: {
        message: string;
        statusCode: number;
    };
};
export declare const formatSuccessResponse: <T>(data: T, message?: string) => {
    success: boolean;
    message: string;
    data: T;
};
//# sourceMappingURL=errors.d.ts.map