import type { TaxRateDto, TaxGroupDto } from "shared";
import { erpApi } from "../../client/erp-client";
import { createCrud } from "../../client/crud-factory";

export const taxesService = {
  rates: createCrud<TaxRateDto>(erpApi, "/settings/taxes/rates"),
  groups: createCrud<TaxGroupDto>(erpApi, "/settings/taxes/groups"),
};
