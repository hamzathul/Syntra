import type { CompanyProfileRecord } from "./company-profile.types";

export interface ICompanyProfileRepository {
  findById(companyId: string): Promise<CompanyProfileRecord | null>;
  update(companyId: string, data: Record<string, unknown>): Promise<CompanyProfileRecord>;
}
