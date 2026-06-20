import type { NextFunction, Request, Response } from "express";
import { BadRequestError, ForbiddenError, getAuthenticatedUser } from "backend-p";
import type { ICompanyRepository } from "../modules/company/company.repository.port";

export function createCompanyContextMiddleware(
  companyRepo: ICompanyRepository,
) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const companyId = req.headers["x-company-id"];

    if (typeof companyId !== "string" || companyId.trim() === "") {
      next(new BadRequestError("X-Company-Id header is required"));
      return;
    }

    const userId = getAuthenticatedUser(res.locals).id;
    const isMember = await companyRepo.isMember(userId, companyId);

    if (!isMember) {
      next(new ForbiddenError("You are not a member of this company"));
      return;
    }

    res.locals.companyId = companyId;
    next();
  };
}
