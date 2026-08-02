import type { TaxRateDto } from "shared";
import type { TaxRateRecord } from "./taxes.types";

export function toTaxRateDto(record: TaxRateRecord): TaxRateDto {
  return {
    id: record.id,
    companyId: record.companyId,
    name: record.name,
    rate: record.rate,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}
