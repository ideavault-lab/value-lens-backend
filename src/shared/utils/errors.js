import ApiError from "./api-error.js";
import { HTTP_STATUS } from "./api-response.js";

export const badRequest = (message = "Bad Request") =>
  new ApiError(
    HTTP_STATUS.BAD_REQUEST,
    message,
    "Bad Request"
  );

export const unauthorized = (message = "Unauthorized") =>
  new ApiError(
    HTTP_STATUS.UNAUTHORIZED,
    message,
    "Unauthorized"
  );

export const forbidden = (message = "Forbidden") =>
  new ApiError(
    HTTP_STATUS.FORBIDDEN,
    message,
    "Forbidden"
  );

export const notFound = (message = "Resource not found") =>
  new ApiError(
    HTTP_STATUS.NOT_FOUND,
    message,
    "Not Found"
  );

export const conflict = (message = "Conflict") =>
  new ApiError(
    HTTP_STATUS.CONFLICT,
    message,
    "Conflict"
  );

export const validationError = (
  message = "Validation failed",
  details = null
) =>
  new ApiError(
    HTTP_STATUS.UNPROCESSABLE_ENTITY,
    message,
    "Validation Error",
    details
  );

export const internalError = (
  message = "Internal server error"
) =>
  new ApiError(
    HTTP_STATUS.INTERNAL_SERVER_ERROR,
    message,
    "Internal Server Error"
  );