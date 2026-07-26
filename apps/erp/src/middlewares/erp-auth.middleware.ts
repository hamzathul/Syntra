import type { NextFunction, Request, Response } from "express";
import { setAuthenticatedUser, UnauthorizedError, type LoggerPort } from "backend-p";
import { getUserFromToken } from "../utils/core-client";

export function createErpAuthMiddleware(logger: LoggerPort) {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      logger.warn(
        { method: req.method, path: req.originalUrl, requestId: req.header("x-request-id") },
        "ERP auth failed — missing authorization header",
      );
      next(new UnauthorizedError("Missing authorization header"));
      return;
    }

    const token = authHeader.slice(7);
    try {
      const user = await getUserFromToken(token);

      setAuthenticatedUser(res, {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      });
      next();
    } catch {
      logger.warn(
        { method: req.method, path: req.originalUrl, requestId: req.header("x-request-id") },
        "ERP auth failed — invalid or expired token",
      );
      next(new UnauthorizedError("Invalid or expired token"));
    }
  };
}
