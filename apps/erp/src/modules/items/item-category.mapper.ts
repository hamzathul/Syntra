import type { ItemCategoryDto } from "shared";
import type { ItemCategoryRecord } from "./items.types";

export function toItemCategoryDto(record: ItemCategoryRecord): ItemCategoryDto {
  return {
    id: record.id,
    companyId: record.companyId,
    name: record.name,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}
