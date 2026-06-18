import type { RequestHandler } from "express";
import { createNotFoundError } from "../errors/http-errors";

export const notFoundHandler: RequestHandler = (request, _response, next) => {
  next(createNotFoundError(`${request.method} ${request.originalUrl}`));
};
