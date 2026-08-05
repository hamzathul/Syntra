import type { CursorPaginationResult } from "backend-p";
import type {
  ItemCreateData,
  ItemRecord,
  ItemUpdateData,
} from "./items.types";

export interface ItemListOptions {
  readonly limit?: number;
  readonly cursor?: string;
}

export interface IItemRepository {
  findAll(companyId: string, options?: ItemListOptions): Promise<CursorPaginationResult<ItemRecord>>;
  findById(id: string, companyId: string): Promise<ItemRecord | null>;
  create(companyId: string, data: ItemCreateData): Promise<ItemRecord>;
  update(id: string, companyId: string, data: ItemUpdateData): Promise<ItemRecord>;
  delete(id: string, companyId: string): Promise<void>;
  existsCode(code: string, companyId: string, excludeId?: string): Promise<boolean>;
  existsBarcode(barcode: string, companyId: string, excludeId?: string): Promise<boolean>;
}
