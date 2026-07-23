import type { CompanyProfileDto, UpdateCompanyProfileDto } from "shared";
import { erpApi } from "../../client/erp-client";

export const companyProfileService = {
  get: (): Promise<CompanyProfileDto> =>
    erpApi.get<CompanyProfileDto>("/settings/company-profile").then((r) => r.data),

  update: (dto: UpdateCompanyProfileDto): Promise<CompanyProfileDto> =>
    erpApi.patch<CompanyProfileDto>("/settings/company-profile", dto).then((r) => r.data),
};
