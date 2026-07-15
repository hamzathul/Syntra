import type { MemberRole } from "shared";
import type { CompanyProfileRecord } from "./company-profile.types";

export interface CompanyMembership {
  role: MemberRole;
  isDefault: boolean;
}

export interface ICompanyProfileRepository {
  findById(companyId: string): Promise<CompanyProfileRecord | null>;
  update(companyId: string, data: Record<string, unknown>): Promise<CompanyProfileRecord>;
  getMembership(userId: string, companyId: string): Promise<CompanyMembership | null>;
}
