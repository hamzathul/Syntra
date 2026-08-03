import type { ItemCategoryRecord } from "./items.types";

export interface ItemCategoryRow {
  readonly id: string;
  readonly companyId: string;
  readonly name: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export function toItemCategoryRecord(row: ItemCategoryRow): ItemCategoryRecord {
  return {
    id: row.id,
    companyId: row.companyId,
    name: row.name,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}
