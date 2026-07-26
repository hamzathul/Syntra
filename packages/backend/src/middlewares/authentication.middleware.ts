import type { RequestHandler, Response } from "express";
import { extractBearerToken } from "../utils/bearer-token";
import { setAuthenticatedUser, type AuthLocals } from "../auth/auth-context";
import type { TokenVerifier } from "../auth/token-verifier.port";
import type { LoggerPort } from "../logger/logger.port";

export const createAuthenticationMiddleware =
  (
    tokenVerifier: TokenVerifier,
    logger?: LoggerPort,
  ): RequestHandler =>
  async (request, response: Response<unknown, AuthLocals>, next) => {
    try {
      const token = extractBearerToken(request.header("authorization"));
      const user = await tokenVerifier.verify(token);
      setAuthenticatedUser(response, user);
      next();
    } catch (error) {
      logger?.warn(
        {
          method: request.method,
          path: request.originalUrl,
          requestId: request.header("x-request-id"),
          errorName: (error as Error).name,
        },
        "Authentication failed",
      );
      next(error);
    }
  };
