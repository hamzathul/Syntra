import type { GeneralSettingsRecord } from "./general-settings.types";

export interface IGeneralSettingsRepository {
  findByCompanyId(companyId: string): Promise<GeneralSettingsRecord | null>;
  upsert(
    companyId: string,
    data: Record<string, unknown>,
  ): Promise<GeneralSettingsRecord>;
}
