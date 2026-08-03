import type { CreateItemDto, ItemDto, UpdateItemDto } from "shared";

export interface IItemService {
  list(companyId: string): Promise<ItemDto[]>;
  get(id: string, companyId: string): Promise<ItemDto>;
  create(companyId: string, dto: CreateItemDto): Promise<ItemDto>;
  update(id: string, companyId: string, dto: UpdateItemDto): Promise<ItemDto>;
  remove(id: string, companyId: string): Promise<void>;
  generateCode(companyId: string): Promise<{ code: string }>;
  generateBarcode(companyId: string): Promise<{ barcode: string }>;
}
