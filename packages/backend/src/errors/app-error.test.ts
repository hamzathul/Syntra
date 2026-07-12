import { describe, it, expect } from "vitest";
import { AppError } from "./app-error.js";
import {
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  ValidationError,
} from "./http-errors.js";

describe("AppError", () => {
  it("sets statusCode, code, and message", () => {
    const error = new AppError(400, "BAD_REQUEST", "test");
    expect(error.statusCode).toBe(400);
    expect(error.code).toBe("BAD_REQUEST");
    expect(error.message).toBe("test");
  });

  it("captures stack trace", () => {
    const error = new AppError(500, "ERROR", "test");
    expect(error.stack).toBeDefined();
  });
});

describe("BadRequestError", () => {
  it("has 400 status and BAD_REQUEST code", () => {
    const error = new BadRequestError();
    expect(error.statusCode).toBe(400);
    expect(error.code).toBe("BAD_REQUEST");
  });

  it("accepts custom message and details", () => {
    const details = [{ code: "INVALID", message: "name is required" }] as const;
    const error = new BadRequestError("Custom message", details);
    expect(error.message).toBe("Custom message");
    expect(error.details).toEqual(details);
  });
});

describe("UnauthorizedError", () => {
  it("has 401 status", () => {
    const error = new UnauthorizedError();
    expect(error.statusCode).toBe(401);
    expect(error.code).toBe("UNAUTHORIZED");
  });
});

describe("ForbiddenError", () => {
  it("has 403 status", () => {
    const error = new ForbiddenError();
    expect(error.statusCode).toBe(403);
    expect(error.code).toBe("FORBIDDEN");
  });
});

describe("NotFoundError", () => {
  it("has 404 status with resource name", () => {
    const error = new NotFoundError("User");
    expect(error.statusCode).toBe(404);
    expect(error.code).toBe("NOT_FOUND");
    expect(error.message).toBe("User was not found");
  });

  it("defaults to Resource", () => {
    const error = new NotFoundError();
    expect(error.message).toBe("Resource was not found");
  });
});

describe("ConflictError", () => {
  it("has 409 status", () => {
    const error = new ConflictError();
    expect(error.statusCode).toBe(409);
    expect(error.code).toBe("CONFLICT");
  });
});

describe("ValidationError", () => {
  it("has 422 status with details", () => {
    const details = [
      { code: "REQUIRED", message: "email is required", path: "email" },
    ] as const;
    const error = new ValidationError(details);
    expect(error.statusCode).toBe(422);
    expect(error.code).toBe("VALIDATION_ERROR");
    expect(error.details).toEqual(details);
  });
});
