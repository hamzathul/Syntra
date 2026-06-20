import type { NextFunction, Request, Response } from "express";
import { setAuthenticatedUser, UnauthorizedError } from "backend-p";
import type { UserRoleDto } from "shared";
import { env } from "../config/env";

interface JwtClaims {
  id: string;
  name: string;
  email: string;
  role: UserRoleDto;
  [key: string]: unknown;
}

const secretKey = new TextEncoder().encode(env.JWT_SECRET);

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
    const { jwtVerify } = await import("jose");
    const { payload } = await jwtVerify(token, secretKey);
    const claims = payload as unknown as JwtClaims;

    setAuthenticatedUser(res, {
      id: claims.id,
      name: claims.name,
      email: claims.email,
      role: claims.role,
    });
    next();
  } catch {
    next(new UnauthorizedError("Invalid or expired token"));
  }
};
