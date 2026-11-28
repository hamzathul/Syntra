import type { SaleDto, SendSaleInvoiceDto } from "shared";
import { erpApi } from "../../client/erp-client";
import { createPaginatedCrud } from "../../client/crud-factory";

export const salesService = {
  sales: createPaginatedCrud<SaleDto>(erpApi, "/sales"),
  sendInvoice: (id: string, dto: SendSaleInvoiceDto): Promise<void> =>
    erpApi.post(`/sales/${id}/send-invoice`, dto).then(() => undefined),
};
