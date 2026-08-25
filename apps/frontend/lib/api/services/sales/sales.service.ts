import type { SaleDto } from "shared";
import { erpApi } from "../../client/erp-client";
import { createPaginatedCrud } from "../../client/crud-factory";

export const salesService = {
  sales: createPaginatedCrud<SaleDto>(erpApi, "/sales"),
};
