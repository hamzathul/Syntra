import { NotFoundError, paginateResult } from "backend-p";
import type { DbClient } from "../../database/db-client";
import type { IItemRepository, ItemListOptions } from "./item.repository.port";
import type {
  ItemCreateData,
  ItemRecord,
  ItemUpdateData,
} from "./items.types";
import { toItemRecord, type ItemRow } from "./item.record";

const DEFAULT_LIST_LIMIT = 25;
const MAX_LIST_LIMIT = 100;

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

  async findAll(companyId: string, options?: ItemListOptions) {
    const limit = Math.min(options?.limit ?? DEFAULT_LIST_LIMIT, MAX_LIST_LIMIT);
    const rawItems = await this.db.item.findMany({
      where: {
        companyId,
        ...(options?.cursor ? { id: { gt: options.cursor } } : {}),
      },
      include: ITEM_INCLUDE,
      orderBy: { createdAt: "desc" },
      take: limit + 1,
    });
    return paginateResult(
      rawItems.map((item) => toItemRecord(item as unknown as ItemRow, { excludeImage: true })),
      limit,
      options?.cursor,
    );
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

  async update(id: string, companyId: string, data: ItemUpdateData): Promise<ItemRecord> {
    const { count } = await this.db.item.updateMany({
      where: { id, companyId },
      data,
    });
    if (count === 0) throw new NotFoundError("Item");

    const item = await this.db.item.findUnique({
      where: { id },
      include: ITEM_INCLUDE,
    });
    return toItemRecord(item as unknown as ItemRow);
  }

  async delete(id: string, companyId: string): Promise<void> {
    const { count } = await this.db.item.deleteMany({ where: { id, companyId } });
    if (count === 0) throw new NotFoundError("Item");
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
