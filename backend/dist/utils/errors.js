// Custom error classes for better error handling
export class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}
export class ValidationError extends AppError {
    constructor(message) {
        super(message, 400);
    }
}
export class AuthenticationError extends AppError {
    constructor(message = 'Authentication failed') {
        super(message, 401);
    }
}
export class AuthorizationError extends AppError {
    constructor(message = 'Access denied') {
        super(message, 403);
    }
}
export class NotFoundError extends AppError {
    constructor(message = 'Resource not found') {
        super(message, 404);
    }
}
export class ConflictError extends AppError {
    constructor(message = 'Resource already exists') {
        super(message, 409);
    }
}
export class RateLimitError extends AppError {
    constructor(message = 'Too many requests') {
        super(message, 429);
    }
}
export class InternalServerError extends AppError {
    constructor(message = 'Internal server error') {
        super(message, 500);
    }
}
// Error response formatter
export const formatErrorResponse = (error) => {
    if (error instanceof AppError) {
        return {
            success: false,
            error: {
                message: error.message,
                statusCode: error.statusCode
            }
        };
    }
    // For unexpected errors, don't expose internal details
    return {
        success: false,
        error: {
            message: 'An unexpected error occurred',
            statusCode: 500
        }
    };
};
// Success response formatter
export const formatSuccessResponse = (data, message) => {
    return {
        success: true,
        message: message || 'Operation successful',
        data
    };
};
//# sourceMappingURL=errors.js.map