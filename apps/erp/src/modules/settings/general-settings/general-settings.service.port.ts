import type { GeneralSettingsDto, UpdateGeneralSettingsDto } from "shared";

export interface IGeneralSettingsService {
  getSettings(companyId: string): Promise<GeneralSettingsDto>;
  updateSettings(
    companyId: string,
    dto: UpdateGeneralSettingsDto,
  ): Promise<GeneralSettingsDto>;
}
