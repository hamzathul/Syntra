import type { NextFunction, Request, Response } from "express";
import { setAuthenticatedUser, UnauthorizedError } from "backend-p";
import { getUserFromToken } from "../utils/core-client";

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
    const user = await getUserFromToken(token);

    setAuthenticatedUser(res, {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
    next();
  } catch {
    next(new UnauthorizedError("Invalid or expired token"));
  }
};
