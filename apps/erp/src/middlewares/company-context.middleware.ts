import type { NextFunction, Request, Response } from "express";
import {
  BadRequestError,
  ForbiddenError,
  getAuthenticatedUser,
  type LoggerPort,
} from "backend-p";
import type { ICompanyRepository } from "../modules/company/company.repository.port";

export function createCompanyContextMiddleware(
  companyRepo: ICompanyRepository,
  logger?: LoggerPort,
) {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const companyId = req.headers["x-company-id"];

    if (typeof companyId !== "string" || companyId.trim() === "") {
      logger?.warn(
        {
          userId: getAuthenticatedUser(res.locals).id,
          method: req.method,
          path: req.originalUrl,
        },
        "Company context missing — X-Company-Id header not provided",
      );
      next(new BadRequestError("X-Company-Id header is required"));
      return;
    }

    const userId = getAuthenticatedUser(res.locals).id;
    const isMember = await companyRepo.isMember(userId, companyId);

    if (!isMember) {
      logger?.warn(
        { userId, companyId, method: req.method, path: req.originalUrl },
        "Company context denied — user is not a member of the requested company",
      );
      next(new ForbiddenError("You are not a member of this company"));
      return;
    }

    res.locals.companyId = companyId;
    next();
  };
}
