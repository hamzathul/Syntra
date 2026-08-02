import type { GeneralSettingsDto } from "shared";
import type { GeneralSettingsRecord } from "./general-settings.types";

export function toGeneralSettingsDto(
  record: GeneralSettingsRecord,
): GeneralSettingsDto {
  return {
    id: record.id,
    companyId: record.companyId,
    businessCurrency: record.businessCurrency,
    decimalPlaces: record.decimalPlaces,
    dateFormat: record.dateFormat,
    stateOfSupplyEnabled: record.stateOfSupplyEnabled,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}
