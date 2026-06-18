import type { ApiErrorDetail } from "shared";
import { AppError } from "./app-error";

export class BadRequestError extends AppError {
  constructor(message = "Bad request", details?: readonly ApiErrorDetail[]) {
    super(400, "BAD_REQUEST", message, details);
  }
}

export class ValidationError extends AppError {
  constructor(details: readonly ApiErrorDetail[]) {
    super(422, "VALIDATION_ERROR", "Request validation failed", details);
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

export const createBadRequestError = (
  message?: string,
  details?: readonly ApiErrorDetail[],
) => new BadRequestError(message, details);

export const createNotFoundError = (resource?: string) =>
  new NotFoundError(resource);
