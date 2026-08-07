import ApiError from "./api-error.js";
import { HTTP_STATUS } from "./api-response.js";

export const badRequest = (
  message = "Bad Request",
  errors = null
) =>
  new ApiError(
    HTTP_STATUS.BAD_REQUEST,
    message,
    "BadRequest",
    null,
    errors
  );

export const unauthorized = (
  message = "Unauthorized",
  errors = null
) =>
  new ApiError(
    HTTP_STATUS.UNAUTHORIZED,
    message,
    "Unauthorized",
    null,
    errors
  );

export const forbidden = (
  message = "Forbidden",
  errors = null
) =>
  new ApiError(
    HTTP_STATUS.FORBIDDEN,
    message,
    "Forbidden",
    null,
    errors
  );

export const notFound = (
  message = "Resource not found",
  errors = null
) =>
  new ApiError(
    HTTP_STATUS.NOT_FOUND,
    message,
    "NotFound",
    null,
    errors
  );

export const conflict = (
  message = "Conflict",
  errors = null
) =>
  new ApiError(
    HTTP_STATUS.CONFLICT,
    message,
    "Conflict",
    null,
    errors
  );

export const validationError = (
  message = "Validation failed",
  errors = null,
  details = null
) =>
  new ApiError(
    HTTP_STATUS.UNPROCESSABLE_ENTITY,
    message,
    "ValidationError",
    details,
    errors
  );

export const internalServerError = (
  message = "Internal server error"
) =>
  new ApiError(
    HTTP_STATUS.INTERNAL_SERVER_ERROR,
    message,
    "InternalServerError"
  );