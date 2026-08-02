import type { CompanyDto } from "shared";
import type { CompanyWithRole } from "./company.types";

export function toCompanyDto(company: CompanyWithRole): CompanyDto {
  return {
    id: company.id,
    name: company.name,
    role: company.role,
    isDefault: company.isDefault,
    createdAt: company.createdAt.toISOString(),
  };
}
