import { UnauthorizedError } from "../errors/http-errors";

const BEARER_PREFIX = "Bearer ";

export const extractBearerToken = (authorizationHeader?: string): string => {
  if (
    authorizationHeader === undefined ||
    !authorizationHeader.startsWith(BEARER_PREFIX)
  ) {
    throw new UnauthorizedError("A valid bearer token is required");
  }

  const token = authorizationHeader.slice(BEARER_PREFIX.length).trim();

  if (token.length === 0) {
    throw new UnauthorizedError("A valid bearer token is required");
  }

  return token;
};
