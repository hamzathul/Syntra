import type { PrismaClient } from "../../../generated/prisma";
import type { IGeneralSettingsRepository } from "./general-settings.repository.port";
import type { GeneralSettingsRecord } from "./general-settings.types";

export class GeneralSettingsRepository implements IGeneralSettingsRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByCompanyId(
    companyId: string,
  ): Promise<GeneralSettingsRecord | null> {
    const settings = await this.prisma.companySettings.findUnique({
      where: { companyId },
    });
    if (!settings) return null;
    return this.mapRecord(settings);
  }

  async upsert(
    companyId: string,
    data: Record<string, unknown>,
  ): Promise<GeneralSettingsRecord> {
    const settings = await this.prisma.companySettings.upsert({
      where: { companyId },
      create: { companyId, ...data } as Record<string, unknown> & {
        companyId: string;
      },
      update: data,
    });
    return this.mapRecord(settings);
  }

  private mapRecord(r: {
    id: string;
    companyId: string;
    businessCurrency: string;
    decimalPlaces: number;
    dateFormat: string;
    stateOfSupplyEnabled: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): GeneralSettingsRecord {
    return {
      id: r.id,
      companyId: r.companyId,
      businessCurrency: r.businessCurrency,
      decimalPlaces: r.decimalPlaces,
      dateFormat: r.dateFormat,
      stateOfSupplyEnabled: r.stateOfSupplyEnabled,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    };
  }
}
