import type { CompanyProfileDto, UpdateCompanyProfileDto } from "shared";

export interface ICompanyProfileService {
  getProfile(companyId: string, userId: string): Promise<CompanyProfileDto>;
  updateProfile(
    companyId: string,
    userId: string,
    dto: UpdateCompanyProfileDto,
  ): Promise<CompanyProfileDto>;
}
