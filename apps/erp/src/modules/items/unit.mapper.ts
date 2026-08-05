import type { UnitDto } from "shared";
import type { UnitRecord } from "./items.types";

export function toUnitDto(record: UnitRecord): UnitDto {
  return {
    id: record.id,
    companyId: record.companyId,
    name: record.name,
    shortName: record.shortName,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}
