import axios from "axios";
import type { CompanyDto, CreateCompanyDto } from "shared";
import { getActiveCompany } from "@/lib/auth";

export const erpApi = axios.create({
  baseURL: "/api/proxy/erp",
  timeout: 8000,
  headers: { "Content-Type": "application/json" },
});

erpApi.interceptors.request.use((config) => {
  const company = getActiveCompany();
  if (company) config.headers["X-Company-Id"] = company.id;
  return config;
});

export const companyApi = {
  list: (): Promise<CompanyDto[]> =>
    erpApi.get<{ data: CompanyDto[] }>("/companies").then((r) => r.data.data),

  create: (dto: CreateCompanyDto): Promise<CompanyDto> =>
    erpApi.post<{ data: CompanyDto }>("/companies", dto).then((r) => r.data.data),
};
