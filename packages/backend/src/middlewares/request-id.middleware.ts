import { randomUUID } from "node:crypto";
import type { RequestHandler } from "express";

const REQUEST_ID_HEADER = "x-request-id";

export const requestIdMiddleware: RequestHandler = (
  request,
  response,
  next,
) => {
  const incomingRequestId = request.header(REQUEST_ID_HEADER);
  const requestId =
    incomingRequestId !== undefined && incomingRequestId.trim().length > 0
      ? incomingRequestId
      : randomUUID();

  request.headers[REQUEST_ID_HEADER] = requestId;
  response.setHeader(REQUEST_ID_HEADER, requestId);
  next();
};
