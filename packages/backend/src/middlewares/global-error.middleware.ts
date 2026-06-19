import type { ErrorRequestHandler } from "express";
import { AppError } from "../errors/app-error";
import { InternalServerError } from "../errors/http-errors";
import type { LoggerPort } from "../logger/logger.port";
import { ResponseFactory } from "../patterns/factory/response.factory";
import { parseStack } from "../utils/parse-stack";

const isDev = process.env["NODE_ENV"] !== "production";

export const createGlobalErrorHandler =
  (logger: LoggerPort): ErrorRequestHandler =>
  (error, request, response, _next) => {
    void _next;

    const isAppError = error instanceof AppError;
    const normalizedError = isAppError ? error : new InternalServerError("Something went wrong");

    logger.error(
      {
        requestId: request.header("x-request-id"),
        method: request.method,
        path: request.originalUrl,
        errorName: (error as Error).name,
        stack: (error as Error).stack,
      },
      normalizedError.message,
    );

    ResponseFactory.createV1Response().error(response, {
      request,
      statusCode: normalizedError.statusCode,
      code: normalizedError.code,
      message: normalizedError.message,
      details: normalizedError.details,
      debug: isDev ? parseStack(isAppError ? error : (error as Error)) : undefined,
    });
  };
