import type { NextFunction, Request, Response } from "express";
import { UnauthorizedError } from "backend-p";
import { getUserFromToken } from "../utils/core-client";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Locals {
      user: { id: string; name: string; email: string; role: "USER" | "ADMIN" };
    }
  }
}

export const erpAuthMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    next(new UnauthorizedError("Missing authorization header"));
    return;
  }

  const token = authHeader.slice(7);
  try {
    res.locals.user = await getUserFromToken(token);
    next();
  } catch {
    next(new UnauthorizedError("Invalid or expired token"));
  }
};
