import type {
  ItemCategoryCreateData,
  ItemCategoryRecord,
  ItemCategoryUpdateData,
} from "./items.types";

export interface IItemCategoryRepository {
  findAll(companyId: string): Promise<ItemCategoryRecord[]>;
  findById(id: string, companyId: string): Promise<ItemCategoryRecord | null>;
  create(companyId: string, data: ItemCategoryCreateData): Promise<ItemCategoryRecord>;
  update(id: string, companyId: string, data: ItemCategoryUpdateData): Promise<ItemCategoryRecord>;
  delete(id: string, companyId: string): Promise<void>;
  countByIds(ids: string[], companyId: string): Promise<number>;
  isUsedInAnyItem(id: string, companyId: string): Promise<boolean>;
}
