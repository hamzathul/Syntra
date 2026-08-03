import type { GeneralSettingsDto, UpdateGeneralSettingsDto } from "shared";
import { erpApi } from "../../client/erp-client";
import { createGetUpdate } from "../../client/crud-factory";

export const generalSettingsService = createGetUpdate<
  GeneralSettingsDto,
  UpdateGeneralSettingsDto
>(erpApi, "/settings/general");
