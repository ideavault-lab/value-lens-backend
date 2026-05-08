// src/common/utils/api-response.js

export const HTTP_STATUS = {
    // SUCCESS
    OK: 200,
    CREATED: 201,
    ACCEPTED: 202,
    NO_CONTENT: 204,

    // REDIRECTION
    MOVED_PERMANENTLY: 301,
    FOUND: 302,
    NOT_MODIFIED: 304,

    // CLIENT ERRORS
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    PAYMENT_REQUIRED: 402,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    METHOD_NOT_ALLOWED: 405,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    TOO_MANY_REQUESTS: 429,

    // SERVER ERRORS
    INTERNAL_SERVER_ERROR: 500,
    NOT_IMPLEMENTED: 501,
    BAD_GATEWAY: 502,
    SERVICE_UNAVAILABLE: 503,
    GATEWAY_TIMEOUT: 504,
};

export const RESPONSE_MESSAGES = {
    // SUCCESS
    SUCCESS: "Success",
    CREATED: "Resource created successfully",
    UPDATED: "Resource updated successfully",
    DELETED: "Resource deleted successfully",

    // AUTH
    UNAUTHORIZED: "Unauthorized access",
    FORBIDDEN: "Access forbidden",

    // COMMON ERRORS
    BAD_REQUEST: "Bad request",
    VALIDATION_ERROR: "Validation failed",
    NOT_FOUND: "Resource not found",
    CONFLICT: "Resource conflict",

    // SERVER
    INTERNAL_SERVER_ERROR: "Internal server error",
    SERVICE_UNAVAILABLE: "Service unavailable",
};

export function successResponse({
    data = null,
    message = RESPONSE_MESSAGES.SUCCESS,
    statusCode = HTTP_STATUS.OK,
    meta = null,
}) {
    return {
        status: true,
        statusCode,
        message,
        ...(meta && { meta }),
        data,
        timestamp: new Date().toISOString(),
    };
}

export function errorResponse({
    statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR,
    error = "Error",
    message = RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
    details = null,
}) {
    return {
        status: false,
        statusCode,
        error,
        message,
        ...(details && { details }),
        timestamp: new Date().toISOString(),
    };
}