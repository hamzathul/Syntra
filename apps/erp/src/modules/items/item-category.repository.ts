import type { PrismaClient } from "../../generated/prisma";
import type { IItemCategoryRepository } from "./item-category.repository.port";
import type {
  ItemCategoryCreateData,
  ItemCategoryRecord,
  ItemCategoryUpdateData,
} from "./items.types";
import { toItemCategoryRecord } from "./item-category.record";

export class ItemCategoryRepository implements IItemCategoryRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findAll(companyId: string): Promise<ItemCategoryRecord[]> {
    const categories = await this.prisma.itemCategory.findMany({
      where: { companyId },
      orderBy: { name: "asc" },
    });
    return categories.map(toItemCategoryRecord);
  }

  async findById(
    id: string,
    companyId: string,
  ): Promise<ItemCategoryRecord | null> {
    const category = await this.prisma.itemCategory.findUnique({
      where: { id },
    });
    if (!category || category.companyId !== companyId) return null;
    return toItemCategoryRecord(category);
  }

  async create(
    companyId: string,
    data: ItemCategoryCreateData,
  ): Promise<ItemCategoryRecord> {
    const category = await this.prisma.itemCategory.create({
      data: { companyId, ...data },
    });
    return toItemCategoryRecord(category);
  }

  async update(
    id: string,
    data: ItemCategoryUpdateData,
  ): Promise<ItemCategoryRecord> {
    const category = await this.prisma.itemCategory.update({
      where: { id },
      data,
    });
    return toItemCategoryRecord(category);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.itemCategory.delete({ where: { id } });
  }

  async countByIds(ids: string[], companyId: string): Promise<number> {
    return this.prisma.itemCategory.count({
      where: { id: { in: ids }, companyId },
    });
  }

  async isUsedInAnyItem(id: string, companyId: string): Promise<boolean> {
    const count = await this.prisma.item.count({
      where: { companyId, categoryId: id },
    });
    return count > 0;
  }
}
