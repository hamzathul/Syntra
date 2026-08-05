import { NotFoundError } from "backend-p";
import type { DbClient } from "../../database/db-client";
import type { IItemCategoryRepository } from "./item-category.repository.port";
import type {
  ItemCategoryCreateData,
  ItemCategoryRecord,
  ItemCategoryUpdateData,
} from "./items.types";
import { toItemCategoryRecord } from "./item-category.record";

export class ItemCategoryRepository implements IItemCategoryRepository {
  constructor(private readonly db: DbClient) {}

  async findAll(companyId: string): Promise<ItemCategoryRecord[]> {
    const categories = await this.db.itemCategory.findMany({
      where: { companyId },
      orderBy: { name: "asc" },
    });
    return categories.map(toItemCategoryRecord);
  }

  async findById(
    id: string,
    companyId: string,
  ): Promise<ItemCategoryRecord | null> {
    const category = await this.db.itemCategory.findUnique({
      where: { id },
    });
    if (!category || category.companyId !== companyId) return null;
    return toItemCategoryRecord(category);
  }

  async create(
    companyId: string,
    data: ItemCategoryCreateData,
  ): Promise<ItemCategoryRecord> {
    const category = await this.db.itemCategory.create({
      data: { companyId, ...data },
    });
    return toItemCategoryRecord(category);
  }

  async update(
    id: string,
    companyId: string,
    data: ItemCategoryUpdateData,
  ): Promise<ItemCategoryRecord> {
    const { count } = await this.db.itemCategory.updateMany({
      where: { id, companyId },
      data,
    });
    if (count === 0) throw new NotFoundError("Item category");

    const category = await this.db.itemCategory.findUnique({ where: { id } });
    return toItemCategoryRecord(category!);
  }

  async delete(id: string, companyId: string): Promise<void> {
    const { count } = await this.db.itemCategory.deleteMany({
      where: { id, companyId },
    });
    if (count === 0) throw new NotFoundError("Item category");
  }

  async countByIds(ids: string[], companyId: string): Promise<number> {
    return this.db.itemCategory.count({
      where: { id: { in: ids }, companyId },
    });
  }

  async isUsedInAnyItem(id: string, companyId: string): Promise<boolean> {
    const count = await this.db.item.count({
      where: { companyId, categoryId: id },
    });
    return count > 0;
  }
}
