import type { RequestHandler } from "express";
import type { UserRoleDto } from "shared";
import { getAuthenticatedUser } from "../auth/auth-context";
import { ForbiddenError } from "../errors/http-errors";

export const authorizeRoles =
  (allowedRoles: readonly UserRoleDto[]): RequestHandler =>
  (_request, response, next) => {
    try {
      const user = getAuthenticatedUser(response.locals);

      if (!allowedRoles.includes(user.role)) {
        throw new ForbiddenError();
      }

      next();
    } catch (error) {
      next(error);
    }
  };
