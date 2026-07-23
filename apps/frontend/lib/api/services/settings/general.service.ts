import type { GeneralSettingsDto, UpdateGeneralSettingsDto } from "shared";
import { erpApi } from "../../client/erp-client";

export const generalSettingsService = {
  get: (): Promise<GeneralSettingsDto> =>
    erpApi.get<GeneralSettingsDto>("/settings/general").then((r) => r.data),

  update: (dto: UpdateGeneralSettingsDto): Promise<GeneralSettingsDto> =>
    erpApi.patch<GeneralSettingsDto>("/settings/general", dto).then((r) => r.data),
};
