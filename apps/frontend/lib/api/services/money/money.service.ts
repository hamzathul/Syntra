import type {
  AdjustmentDto,
  AdjustBankDto,
  AdjustCashDto,
  BankAdjustmentDto,
  BankHistoryDto,
  CashSummaryDto,
  TransferDto,
} from "shared";
import { erpApi } from "../../client/erp-client";
import { createCrud } from "../../client/crud-factory";

export const moneyService = {
  getCashSummary: (): Promise<CashSummaryDto> =>
    erpApi.get<CashSummaryDto>("/money/cash").then((r) => r.data),

  adjustCash: (dto: AdjustCashDto): Promise<AdjustmentDto> =>
    erpApi.post<AdjustmentDto>("/money/cash/adjust", dto).then((r) => r.data),

  adjustBank: (
    bankId: string,
    dto: AdjustBankDto,
  ): Promise<BankAdjustmentDto> =>
    erpApi
      .post<BankAdjustmentDto>(`/money/banks/${bankId}/adjust`, dto)
      .then((r) => r.data),

  getBankHistory: (bankId: string): Promise<BankHistoryDto> =>
    erpApi
      .get<BankHistoryDto>(`/money/banks/${bankId}/movements`)
      .then((r) => r.data),

  cashAdjustments: createCrud<AdjustmentDto>(
    erpApi,
    "/money/cash/adjustments",
  ),

  transfers: createCrud<TransferDto>(erpApi, "/money/transfers"),

  banks: {
    adjustments: (bankId: string) =>
      createCrud<BankAdjustmentDto>(
        erpApi,
        `/money/banks/${bankId}/adjustments`,
      ),
  },
};