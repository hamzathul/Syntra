import type { DbClient } from "../../../database/db-client";
import type { ITaxRateRepository } from "./tax-rate.repository.port";
import type { TaxRateRecord } from "./taxes.types";
import { toTaxRateRecord } from "./tax-rate.record";

export class TaxRateRepository implements ITaxRateRepository {
  constructor(private readonly db: DbClient) {}

  async findAll(companyId: string): Promise<TaxRateRecord[]> {
    const rates = await this.db.taxRate.findMany({
      where: { companyId },
      orderBy: { name: "asc" },
    });
    return rates.map(toTaxRateRecord);
  }

  async findById(id: string, companyId: string): Promise<TaxRateRecord | null> {
    const rate = await this.db.taxRate.findUnique({
      where: { id },
    });
    if (!rate || rate.companyId !== companyId) return null;
    return toTaxRateRecord(rate);
  }

  async create(
    companyId: string,
    data: { name: string; rate: number },
  ): Promise<TaxRateRecord> {
    const rate = await this.db.taxRate.create({
      data: { companyId, ...data },
    });
    return toTaxRateRecord(rate);
  }

  async update(
    id: string,
    data: { name?: string; rate?: number },
  ): Promise<TaxRateRecord> {
    const rate = await this.db.taxRate.update({
      where: { id },
      data,
    });
    return toTaxRateRecord(rate);
  }

  async delete(id: string): Promise<TaxRateRecord> {
    const rate = await this.db.taxRate.delete({
      where: { id },
    });
    return toTaxRateRecord(rate);
  }

  async isUsedInAnyGroup(id: string, companyId: string): Promise<boolean> {
    const count = await this.db.taxGroupRate.count({
      where: { taxRateId: id, taxGroup: { companyId } },
    });
    return count > 0;
  }

  async countByIds(ids: string[], companyId: string): Promise<number> {
    return this.db.taxRate.count({
      where: { id: { in: ids }, companyId },
    });
  }
}
