import type {
  CreateItemCategoryDto,
  ItemCategoryDto,
  UpdateItemCategoryDto,
} from "shared";

export interface IItemCategoryService {
  list(companyId: string): Promise<ItemCategoryDto[]>;
  create(companyId: string, dto: CreateItemCategoryDto): Promise<ItemCategoryDto>;
  update(
    id: string,
    companyId: string,
    dto: UpdateItemCategoryDto,
  ): Promise<ItemCategoryDto>;
  remove(id: string, companyId: string): Promise<void>;
}
