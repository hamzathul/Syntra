import type {
  ItemCreateData,
  ItemRecord,
  ItemUpdateData,
} from "./items.types";

export interface IItemRepository {
  findAll(companyId: string): Promise<ItemRecord[]>;
  findById(id: string, companyId: string): Promise<ItemRecord | null>;
  create(companyId: string, data: ItemCreateData): Promise<ItemRecord>;
  update(id: string, data: ItemUpdateData): Promise<ItemRecord>;
  delete(id: string): Promise<void>;
  existsCode(code: string, companyId: string, excludeId?: string): Promise<boolean>;
  existsBarcode(barcode: string, companyId: string, excludeId?: string): Promise<boolean>;
}
