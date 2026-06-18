import type { RequestHandler } from "express";
import type { z } from "zod";
import type { ApiErrorDetail } from "shared";
import { ValidationError } from "../errors/http-errors";

interface RequestValidationSchemas {
  readonly body?: z.ZodType;
  readonly params?: z.ZodType;
  readonly query?: z.ZodType;
}

const toValidationDetails = (
  issues: readonly z.core.$ZodIssue[],
  location: "body" | "params" | "query",
): readonly ApiErrorDetail[] =>
  issues.map((issue) => ({
    code: "INVALID_FIELD",
    message: issue.message,
    path: [location, ...issue.path.map(String)].join("."),
  }));

export const validateRequest =
  (schemas: RequestValidationSchemas): RequestHandler =>
  (request, _response, next) => {
    const validations = [
      { schema: schemas.body, value: request.body, location: "body" as const },
      {
        schema: schemas.params,
        value: request.params,
        location: "params" as const,
      },
      { schema: schemas.query, value: request.query, location: "query" as const },
    ];

    const details = validations.flatMap((validation) => {
      if (validation.schema === undefined) {
        return [];
      }

      const result = validation.schema.safeParse(validation.value);

      if (result.success) {
        return [];
      }

      return toValidationDetails(result.error.issues, validation.location);
    });

    if (details.length > 0) {
      next(new ValidationError(details));
      return;
    }

    next();
  };
