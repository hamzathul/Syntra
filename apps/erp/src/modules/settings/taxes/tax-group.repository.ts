import type { PrismaClient } from "../../../generated/prisma";
import type { ITaxGroupRepository } from "./tax-group.repository.port";
import type { TaxGroupRecord } from "./taxes.types";

export class TaxGroupRepository implements ITaxGroupRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findAll(companyId: string): Promise<TaxGroupRecord[]> {
    const groups = await this.prisma.taxGroup.findMany({
      where: { companyId },
      include: {
        groupRates: {
          include: { taxRate: true },
        },
      },
      orderBy: { name: "asc" },
    });
    return groups.map((g) => this.mapRecord(g));
  }

  async findById(id: string, companyId: string): Promise<TaxGroupRecord | null> {
    const group = await this.prisma.taxGroup.findUnique({
      where: { id },
      include: {
        groupRates: {
          include: { taxRate: true },
        },
      },
    });
    if (!group || group.companyId !== companyId) return null;
    return this.mapRecord(group);
  }

  async create(companyId: string, data: { name: string; taxRateIds: string[] }): Promise<TaxGroupRecord> {
    const ids = [...new Set(data.taxRateIds)];
    const group = await this.prisma.taxGroup.create({
      data: {
        companyId,
        name: data.name,
        groupRates: {
          create: ids.map((taxRateId) => ({ taxRateId })),
        },
      },
      include: {
        groupRates: {
          include: { taxRate: true },
        },
      },
    });
    return this.mapRecord(group);
  }

  async update(id: string, companyId: string, data: { name?: string; taxRateIds?: string[] }): Promise<TaxGroupRecord> {
    const group = await this.prisma.$transaction(async (tx) => {
      if (data.taxRateIds) {
        const ids = [...new Set(data.taxRateIds)];
        await tx.taxGroupRate.deleteMany({ where: { taxGroupId: id } });
        await tx.taxGroupRate.createMany({
          data: ids.map((taxRateId) => ({ taxGroupId: id, taxRateId })),
        });
      }

      const updated = await tx.taxGroup.update({
        where: { id },
        data: { name: data.name },
        include: {
          groupRates: {
            include: { taxRate: true },
          },
        },
      });
      return updated;
    });
    return this.mapRecord(group);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.taxGroup.delete({ where: { id } });
  }

  private mapRecord(r: {
    id: string;
    companyId: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    groupRates: Array<{
      taxRate: {
        id: string;
        companyId: string;
        name: string;
        rate: number;
        createdAt: Date;
        updatedAt: Date;
      };
    }>;
  }): TaxGroupRecord {
    return {
      id: r.id,
      companyId: r.companyId,
      name: r.name,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      groupRates: r.groupRates.map((gr) => ({
        taxRate: {
          id: gr.taxRate.id,
          companyId: gr.taxRate.companyId,
          name: gr.taxRate.name,
          rate: Number(gr.taxRate.rate),
          createdAt: gr.taxRate.createdAt,
          updatedAt: gr.taxRate.updatedAt,
        },
      })),
    };
  }
}
