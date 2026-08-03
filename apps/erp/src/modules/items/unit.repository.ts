import type { DbClient } from "../../database/db-client";
import type { IUnitRepository } from "./unit.repository.port";
import type {
  UnitCreateData,
  UnitRecord,
  UnitUpdateData,
} from "./items.types";
import { defaultUnits } from "./default-units";
import { toUnitRecord } from "./unit.record";

export class UnitRepository implements IUnitRepository {
  constructor(private readonly db: DbClient) {}

  async findAll(companyId: string): Promise<UnitRecord[]> {
    const units = await this.db.unit.findMany({
      where: { companyId },
      orderBy: { name: "asc" },
    });
    return units.map(toUnitRecord);
  }

  async findById(id: string, companyId: string): Promise<UnitRecord | null> {
    const unit = await this.db.unit.findUnique({ where: { id } });
    if (!unit || unit.companyId !== companyId) return null;
    return toUnitRecord(unit);
  }

  async create(
    companyId: string,
    data: UnitCreateData,
  ): Promise<UnitRecord> {
    const unit = await this.db.unit.create({
      data: { companyId, ...data },
    });
    return toUnitRecord(unit);
  }

  async update(id: string, data: UnitUpdateData): Promise<UnitRecord> {
    const unit = await this.db.unit.update({ where: { id }, data });
    return toUnitRecord(unit);
  }

  async delete(id: string): Promise<void> {
    await this.db.unit.delete({ where: { id } });
  }

  async countByIds(ids: string[], companyId: string): Promise<number> {
    return this.db.unit.count({
      where: { id: { in: ids }, companyId },
    });
  }

  async isUsedInAnyItem(id: string, companyId: string): Promise<boolean> {
    const count = await this.db.item.count({
      where: {
        companyId,
        OR: [{ unitPrimaryId: id }, { unitSecondaryId: id }],
      },
    });
    return count > 0;
  }

  async seedDefaults(companyId: string): Promise<void> {
    const existing = await this.db.unit.findMany({
      where: { companyId },
      select: { name: true },
    });
    const existingNames = new Set(existing.map((u) => u.name));
    const toCreate = defaultUnits
      .filter((u) => !existingNames.has(u.name))
      .map((u) => ({ companyId, name: u.name, shortName: u.shortName }));

    if (toCreate.length > 0) {
      await this.db.unit.createMany({ data: toCreate });
    }
  }
}
