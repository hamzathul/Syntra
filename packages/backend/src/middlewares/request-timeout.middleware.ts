import type { RequestHandler } from "express";
import { V1Response } from "../responses/v1-response";

export const createRequestTimeoutMiddleware =
  (timeoutMs: number): RequestHandler =>
  (request, response, next) => {
    const timer = setTimeout(() => {
      if (response.headersSent) {
        response.destroy();
        return;
      }

      V1Response.getInstance().error(response, {
        request,
        statusCode: 408,
        code: "REQUEST_TIMEOUT",
        message: "Request timed out",
      });
    }, timeoutMs);

    response.on("finish", () => clearTimeout(timer));
    response.on("close", () => clearTimeout(timer));

    next();
  };
