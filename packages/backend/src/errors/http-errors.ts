import type { ApiErrorDetail } from "shared";
import { AppError } from "./app-error";

export class BadRequestError extends AppError {
  constructor(message = "Bad request", details?: readonly ApiErrorDetail[]) {
    super(400, "BAD_REQUEST", message, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Authentication is required") {
    super(401, "UNAUTHORIZED", message);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "You do not have permission to access this resource") {
    super(403, "FORBIDDEN", message);
  }
}

export class ValidationError extends AppError {
  constructor(details: readonly ApiErrorDetail[]) {
    super(422, "VALIDATION_ERROR", "Request validation failed", details);
  }
}

export class ConflictError extends AppError {
  constructor(message = "Resource already exists") {
    super(409, "CONFLICT", message);
  }
}

export class NotFoundError extends AppError {
  constructor(resource = "Resource") {
    super(404, "NOT_FOUND", `${resource} was not found`);
  }
}

export class InternalServerError extends AppError {
  constructor(message = "Internal server error") {
    super(500, "INTERNAL_SERVER_ERROR", message);
  }
}
