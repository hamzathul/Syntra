import type { GeneralSettingsDto, UpdateGeneralSettingsDto } from "shared";
import type { LoggerPort } from "backend-p";
import type { IGeneralSettingsRepository } from "./general-settings.repository.port";
import type { IGeneralSettingsService } from "./general-settings.service.port";
import { toGeneralSettingsDto } from "./general-settings.mapper";

const DEFAULTS = {
  businessCurrency: "INR",
  decimalPlaces: 2,
  dateFormat: "DD/MM/YYYY",
  stateOfSupplyEnabled: false,
} as const;

export class GeneralSettingsService implements IGeneralSettingsService {
  constructor(
    private readonly repo: IGeneralSettingsRepository,
    private readonly logger: LoggerPort,
  ) {}

  async getSettings(companyId: string): Promise<GeneralSettingsDto> {
    const existing = await this.repo.findByCompanyId(companyId);
    if (existing) return toGeneralSettingsDto(existing);

    const created = await this.repo.upsert(companyId, DEFAULTS);

    this.logger.info(
      { category: "audit", action: "general-settings.created", companyId },
      "General settings created with defaults",
    );

    return toGeneralSettingsDto(created);
  }

  async updateSettings(
    companyId: string,
    dto: UpdateGeneralSettingsDto,
  ): Promise<GeneralSettingsDto> {
    const data = this.prepareUpdateData(dto);
    const updated = await this.repo.upsert(companyId, data);

    this.logger.info(
      { category: "audit", action: "general-settings.updated", companyId },
      "General settings updated",
    );

    return toGeneralSettingsDto(updated);
  }

  private prepareUpdateData(
    dto: UpdateGeneralSettingsDto,
  ): Record<string, unknown> {
    const data: Record<string, unknown> = {};
    const keys: (keyof UpdateGeneralSettingsDto)[] = [
      "businessCurrency",
      "decimalPlaces",
      "dateFormat",
      "stateOfSupplyEnabled",
    ];
    for (const key of keys) {
      if (key in dto) {
        data[key] = dto[key];
      }
    }
    return data;
  }
}
