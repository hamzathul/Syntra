import type { TaxRateRecord } from "./taxes.types";

export interface TaxRateRow {
  readonly id: string;
  readonly companyId: string;
  readonly name: string;
  readonly rate: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export function toTaxRateRecord(row: TaxRateRow): TaxRateRecord {
  return {
    id: row.id,
    companyId: row.companyId,
    name: row.name,
    rate: Number(row.rate),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}
