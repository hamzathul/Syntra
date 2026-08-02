import type { TaxGroupDto } from "shared";
import type { TaxGroupRecord } from "./taxes.types";
import { toTaxRateDto } from "./tax-rate.mapper";

export function toTaxGroupDto(record: TaxGroupRecord): TaxGroupDto {
  const rates = record.groupRates.map((gr) => toTaxRateDto(gr.taxRate));

  return {
    id: record.id,
    companyId: record.companyId,
    name: record.name,
    rates,
    totalRate: rates.reduce((sum, r) => sum + r.rate, 0),
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}
