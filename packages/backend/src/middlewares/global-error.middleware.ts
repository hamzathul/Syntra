import type { ErrorRequestHandler } from "express";
import { AppError } from "../errors/app-error";
import { InternalServerError } from "../errors/http-errors";
import type { LoggerPort } from "../logger/logger.port";
import { ResponseFactory } from "../patterns/factory/response.factory";
import { parseStack } from "../utils/parse-stack";

const shouldExposeDebug = (): boolean =>
  process.env["NODE_ENV"] !== "production";

const normalizeError = (error: unknown): AppError => {
  if (error instanceof AppError) return error;
  return new InternalServerError("Something went wrong");
};

export const createGlobalErrorHandler =
  (logger: LoggerPort): ErrorRequestHandler =>
  (error, request, response, _next) => {
    void _next;

    const normalizedError = normalizeError(error);

    logger.error(
      {
        requestId: request.header("x-request-id"),
        method: request.method,
        path: request.originalUrl,
        errorName: (error as Error).name,
        ...(shouldExposeDebug() && { stack: (error as Error).stack }),
      },
      normalizedError.message,
    );

    ResponseFactory.createV1Response().error(response, {
      request,
      statusCode: normalizedError.statusCode,
      code: normalizedError.code,
      message: normalizedError.message,
      details: normalizedError.details,
      debug: shouldExposeDebug() ? parseStack(error as Error) : undefined,
    });
  };
