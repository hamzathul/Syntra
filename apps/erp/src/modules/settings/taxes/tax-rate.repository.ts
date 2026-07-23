import type { PrismaClient } from "../../../generated/prisma";
import type { ITaxRateRepository } from "./tax-rate.repository.port";
import type { TaxRateRecord } from "./taxes.types";

export class TaxRateRepository implements ITaxRateRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findAll(companyId: string): Promise<TaxRateRecord[]> {
    const rates = await this.prisma.taxRate.findMany({
      where: { companyId },
      orderBy: { name: "asc" },
    });
    return rates.map((r) => this.mapRecord(r));
  }

  async findById(id: string, companyId: string): Promise<TaxRateRecord | null> {
    const rate = await this.prisma.taxRate.findUnique({
      where: { id },
    });
    if (!rate || rate.companyId !== companyId) return null;
    return this.mapRecord(rate);
  }

  async create(companyId: string, data: { name: string; rate: number }): Promise<TaxRateRecord> {
    const rate = await this.prisma.taxRate.create({
      data: { companyId, ...data },
    });
    return this.mapRecord(rate);
  }

  async update(id: string, data: { name?: string; rate?: number }): Promise<TaxRateRecord> {
    const rate = await this.prisma.taxRate.update({
      where: { id },
      data,
    });
    return this.mapRecord(rate);
  }

  async delete(id: string): Promise<TaxRateRecord> {
    const rate = await this.prisma.taxRate.delete({
      where: { id },
    });
    return this.mapRecord(rate);
  }

  async isUsedInAnyGroup(id: string, companyId: string): Promise<boolean> {
    const count = await this.prisma.taxGroupRate.count({
      where: { taxRateId: id, taxGroup: { companyId } },
    });
    return count > 0;
  }

  private mapRecord(r: {
    id: string;
    companyId: string;
    name: string;
    rate: number;
    createdAt: Date;
    updatedAt: Date;
  }): TaxRateRecord {
    return {
      id: r.id,
      companyId: r.companyId,
      name: r.name,
      rate: Number(r.rate),
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    };
  }
}
