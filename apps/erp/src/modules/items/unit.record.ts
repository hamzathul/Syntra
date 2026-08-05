import type { UnitRecord } from "./items.types";

export interface UnitRow {
  readonly id: string;
  readonly companyId: string;
  readonly name: string;
  readonly shortName: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export function toUnitRecord(row: UnitRow): UnitRecord {
  return {
    id: row.id,
    companyId: row.companyId,
    name: row.name,
    shortName: row.shortName,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}
