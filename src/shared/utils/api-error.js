import { HTTP_STATUS } from "./api-response.js";

class ApiError extends Error {
  constructor(
    statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR,
    message = "Internal Server Error",
    error = "Error",
    details = null,
    errors = null
  ) {
    super(message);

    this.statusCode = statusCode;
    this.error = error;
    this.details = details;
    this.errors = errors;


    Error.captureStackTrace(this, this.constructor);
  }
}

export default ApiError;