import type { CompanyDto, CreateCompanyDto } from "shared";

export interface ICompanyService {
  createCompany(dto: CreateCompanyDto, userId: string): Promise<CompanyDto>;
  getUserCompanies(userId: string): Promise<CompanyDto[]>;
}
