import axios from "axios";
import type { CompanyDto, CreateCompanyDto, CompanyProfileDto, UpdateCompanyProfileDto } from "shared";
import { getActiveCompany } from "@/lib/auth";

export const erpApi = axios.create({
  baseURL: "/api/proxy/erp",
  timeout: 8000,
  headers: { "Content-Type": "application/json" },
});

erpApi.interceptors.response.use((response) => {
  if (response.data && typeof response.data === "object" && "data" in response.data) {
    response.data = response.data.data;
  }
  return response;
});

erpApi.interceptors.request.use((config) => {
  const company = getActiveCompany();
  if (company) config.headers["X-Company-Id"] = company.id;
  return config;
});

export const companyApi = {
  list: (): Promise<CompanyDto[]> =>
    erpApi.get<CompanyDto[]>("/companies").then((r) => r.data),

  create: (dto: CreateCompanyDto): Promise<CompanyDto> =>
    erpApi.post<CompanyDto>("/companies", dto).then((r) => r.data),
};

export const settingsApi = {
  getCompanyProfile: (): Promise<CompanyProfileDto> =>
    erpApi.get<CompanyProfileDto>("/settings/company-profile").then((r) => r.data),

  updateCompanyProfile: (dto: UpdateCompanyProfileDto): Promise<CompanyProfileDto> =>
    erpApi.patch<CompanyProfileDto>("/settings/company-profile", dto).then((r) => r.data),

};
