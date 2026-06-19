import type { RequestHandler } from "express";
import type { LoggerPort } from "../logger/logger.port";

export const createRequestLogMiddleware = (logger: LoggerPort): RequestHandler =>
  (request, response, next) => {
    const startAt = process.hrtime();

    response.on("finish", () => {
      const [seconds, nanoseconds] = process.hrtime(startAt);
      const durationMs = Math.round(seconds * 1_000 + nanoseconds / 1_000_000);

      logger.info(
        {
          method: request.method,
          url: request.originalUrl,
          statusCode: response.statusCode,
          durationMs,
          requestId: request.header("x-request-id"),
        },
        "Request handled",
      );
    });

    next();
  };
