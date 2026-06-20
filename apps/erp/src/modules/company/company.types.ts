import type { MemberRole } from "shared";

export type { MemberRole };

export interface CompanyRecord {
  readonly id: string;
  readonly name: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface CompanyWithRole extends CompanyRecord {
  readonly role: MemberRole;
  readonly isDefault: boolean;
}

export interface CreateCompanyInput {
  readonly name: string;
  readonly userId: string;
}
