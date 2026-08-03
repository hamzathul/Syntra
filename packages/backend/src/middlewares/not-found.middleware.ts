import type { RequestHandler } from "express";
import { NotFoundError } from "../errors/http-errors";

export const notFoundHandler: RequestHandler = (request, _response, next) => {
  next(new NotFoundError(`${request.method} ${request.originalUrl}`));
};
