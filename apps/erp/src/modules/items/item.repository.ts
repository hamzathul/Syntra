import type { DbClient } from "../../database/db-client";
import type { IItemRepository } from "./item.repository.port";
import type {
  ItemCreateData,
  ItemRecord,
  ItemUpdateData,
} from "./items.types";
import { toItemRecord, type ItemRow } from "./item.record";

const ITEM_INCLUDE = {
  category: true,
  unitPrimary: true,
  unitSecondary: true,
  taxRate: true,
  taxGroup: {
    include: {
      groupRates: {
        include: { taxRate: true },
      },
    },
  },
} as const;

export class ItemRepository implements IItemRepository {
  constructor(private readonly db: DbClient) {}

  async findAll(companyId: string): Promise<ItemRecord[]> {
    const items = await this.db.item.findMany({
      where: { companyId },
      include: ITEM_INCLUDE,
      orderBy: { createdAt: "desc" },
    });
    return items.map((item) => toItemRecord(item as unknown as ItemRow));
  }

  async findById(id: string, companyId: string): Promise<ItemRecord | null> {
    const item = await this.db.item.findUnique({
      where: { id },
      include: ITEM_INCLUDE,
    });
    if (!item || item.companyId !== companyId) return null;
    return toItemRecord(item as unknown as ItemRow);
  }

  async create(companyId: string, data: ItemCreateData): Promise<ItemRecord> {
    const item = await this.db.item.create({
      data: { ...data, companyId },
      include: ITEM_INCLUDE,
    });
    return toItemRecord(item as unknown as ItemRow);
  }

  async update(id: string, data: ItemUpdateData): Promise<ItemRecord> {
    const item = await this.db.item.update({
      where: { id },
      data,
      include: ITEM_INCLUDE,
    });
    return toItemRecord(item as unknown as ItemRow);
  }

  async delete(id: string): Promise<void> {
    await this.db.item.delete({ where: { id } });
  }

  async existsCode(
    code: string,
    companyId: string,
    excludeId?: string,
  ): Promise<boolean> {
    const count = await this.db.item.count({
      where: {
        companyId,
        itemCode: code,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
    });
    return count > 0;
  }

  async existsBarcode(
    barcode: string,
    companyId: string,
    excludeId?: string,
  ): Promise<boolean> {
    const count = await this.db.item.count({
      where: {
        companyId,
        barcode,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
    });
    return count > 0;
  }
}
