import type { RequestHandler } from "express";
import { sanitizeUnknown } from "../utils/sanitize";

export const sanitizeRequestBody: RequestHandler = (request, _response, next) => {
  if (request.body !== undefined) {
    request.body = sanitizeUnknown(request.body);
  }

  next();
};
