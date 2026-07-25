import type { CompanyDto, CreateCompanyDto } from "shared";
import { erpApi } from "../client/erp-client";

export const companyService = {
  list: (): Promise<CompanyDto[]> =>
    erpApi.get<CompanyDto[]>("/companies").then((r) => r.data),

  create: (dto: CreateCompanyDto): Promise<CompanyDto> =>
    erpApi.post<CompanyDto>("/companies", dto).then((r) => r.data),
};
