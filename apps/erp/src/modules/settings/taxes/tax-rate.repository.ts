import type { PrismaClient } from "../../../generated/prisma";
import type { ITaxRateRepository } from "./tax-rate.repository.port";
import type { TaxRateRecord } from "./taxes.types";
import { toTaxRateRecord } from "./tax-rate.record";

export class TaxRateRepository implements ITaxRateRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findAll(companyId: string): Promise<TaxRateRecord[]> {
    const rates = await this.prisma.taxRate.findMany({
      where: { companyId },
      orderBy: { name: "asc" },
    });
    return rates.map(toTaxRateRecord);
  }

  async findById(id: string, companyId: string): Promise<TaxRateRecord | null> {
    const rate = await this.prisma.taxRate.findUnique({
      where: { id },
    });
    if (!rate || rate.companyId !== companyId) return null;
    return toTaxRateRecord(rate);
  }

  async create(
    companyId: string,
    data: { name: string; rate: number },
  ): Promise<TaxRateRecord> {
    const rate = await this.prisma.taxRate.create({
      data: { companyId, ...data },
    });
    return toTaxRateRecord(rate);
  }

  async update(
    id: string,
    data: { name?: string; rate?: number },
  ): Promise<TaxRateRecord> {
    const rate = await this.prisma.taxRate.update({
      where: { id },
      data,
    });
    return toTaxRateRecord(rate);
  }

  async delete(id: string): Promise<TaxRateRecord> {
    const rate = await this.prisma.taxRate.delete({
      where: { id },
    });
    return toTaxRateRecord(rate);
  }

  async isUsedInAnyGroup(id: string, companyId: string): Promise<boolean> {
    const count = await this.prisma.taxGroupRate.count({
      where: { taxRateId: id, taxGroup: { companyId } },
    });
    return count > 0;
  }

  async countByIds(ids: string[], companyId: string): Promise<number> {
    return this.prisma.taxRate.count({
      where: { id: { in: ids }, companyId },
    });
  }
}
