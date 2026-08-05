import type {
  UnitCreateData,
  UnitRecord,
  UnitUpdateData,
} from "./items.types";

export interface IUnitRepository {
  findAll(companyId: string): Promise<UnitRecord[]>;
  findById(id: string, companyId: string): Promise<UnitRecord | null>;
  create(companyId: string, data: UnitCreateData): Promise<UnitRecord>;
  update(id: string, companyId: string, data: UnitUpdateData): Promise<UnitRecord>;
  delete(id: string, companyId: string): Promise<void>;
  countByIds(ids: string[], companyId: string): Promise<number>;
  isUsedInAnyItem(id: string, companyId: string): Promise<boolean>;
  seedDefaults(companyId: string): Promise<void>;
}
