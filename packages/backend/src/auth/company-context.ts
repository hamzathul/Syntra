import { BadRequestError } from "../errors/http-errors";

export interface CompanyLocals {
  readonly companyId?: string;
}

export const getCompanyId = (locals: CompanyLocals): string => {
  if (locals.companyId === undefined) {
    throw new BadRequestError("Company ID not found in request context");
  }

  return locals.companyId;
};
