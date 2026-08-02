import type { CompanyProfileDto } from "shared";
import type { CompanyProfileRecord } from "./company-profile.types";
import type { CompanyMembership } from "./company-profile.repository.port";

export function toCompanyProfileDto(
  record: CompanyProfileRecord,
  membership: CompanyMembership | null,
): CompanyProfileDto {
  return {
    id: record.id,
    name: record.name,
    role: membership?.role ?? "MEMBER",
    isDefault: membership?.isDefault ?? false,
    createdAt: record.createdAt.toISOString(),
    gstin: record.gstin,
    phone1: record.phone1,
    phone2: record.phone2,
    email: record.email,
    address: record.address,
    pincode: record.pincode,
    description: record.description,
    signature: record.signature,
    state: record.state,
    businessType: record.businessType,
    businessCategory: record.businessCategory,
    logo: record.logo,
    showOnCard: Array.isArray(record.showOnCard) ? record.showOnCard : [],
  };
}
