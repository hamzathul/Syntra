import type { CompanyProfileDto, UpdateCompanyProfileDto } from "shared";

export interface ICompanyProfileService {
  getProfile(companyId: string): Promise<CompanyProfileDto>;
  updateProfile(companyId: string, dto: UpdateCompanyProfileDto): Promise<CompanyProfileDto>;
}
