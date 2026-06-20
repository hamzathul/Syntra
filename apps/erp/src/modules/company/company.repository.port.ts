import type { MemberRole, CompanyWithRole, CreateCompanyInput } from "./company.types";

export interface ICompanyRepository {
  create(input: CreateCompanyInput): Promise<CompanyWithRole>;
  findByUserId(userId: string): Promise<CompanyWithRole[]>;
  isMember(userId: string, companyId: string): Promise<boolean>;
  getMemberRole(userId: string, companyId: string): Promise<MemberRole | null>;
}
