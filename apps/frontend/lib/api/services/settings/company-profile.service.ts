import type { CompanyProfileDto, UpdateCompanyProfileDto } from "shared";
import { erpApi } from "../../client/erp-client";
import { createGetUpdate } from "../../client/crud-factory";

export const companyProfileService = createGetUpdate<
  CompanyProfileDto,
  UpdateCompanyProfileDto
>(erpApi, "/settings/company-profile");
