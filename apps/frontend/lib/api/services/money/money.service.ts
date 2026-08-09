import type {
  AdjustmentDto,
  AdjustBankDto,
  AdjustCashDto,
  BankAdjustmentDto,
  BankHistoryDto,
  CashSummaryDto,
  CreateTransferDto,
  TransferDto,
} from "shared";
import { erpApi } from "../../client/erp-client";

const CASH = "CASH";

export const moneyService = {
  getCashSummary: (): Promise<CashSummaryDto> =>
    erpApi.get<CashSummaryDto>("/money/cash").then((r) => r.data),

  adjustCash: (dto: AdjustCashDto): Promise<AdjustmentDto> =>
    erpApi.post<AdjustmentDto>("/money/cash/adjust", dto).then((r) => r.data),

  updateCashAdjustment: (
    adjustmentId: string,
    dto: AdjustCashDto,
  ): Promise<AdjustmentDto> =>
    erpApi
      .patch<AdjustmentDto>(`/money/cash/adjustments/${adjustmentId}`, dto)
      .then((r) => r.data),

  deleteCashAdjustment: (adjustmentId: string): Promise<void> =>
    erpApi
      .delete(`/money/cash/adjustments/${adjustmentId}`)
      .then(() => undefined),

  createTransfer: (dto: CreateTransferDto): Promise<TransferDto> =>
    erpApi.post<TransferDto>("/money/transfers", dto).then((r) => r.data),

  updateTransfer: (
    transferId: string,
    dto: CreateTransferDto,
  ): Promise<TransferDto> =>
    erpApi
      .patch<TransferDto>(`/money/transfers/${transferId}`, dto)
      .then((r) => r.data),

  deleteTransfer: (transferId: string): Promise<void> =>
    erpApi.delete(`/money/transfers/${transferId}`).then(() => undefined),

  adjustBank: (
    bankId: string,
    dto: AdjustBankDto,
  ): Promise<BankAdjustmentDto> =>
    erpApi
      .post<BankAdjustmentDto>(`/money/banks/${bankId}/adjust`, dto)
      .then((r) => r.data),

  updateBankAdjustment: (
    adjustmentId: string,
    bankId: string,
    dto: AdjustBankDto,
  ): Promise<BankAdjustmentDto> =>
    erpApi
      .patch<BankAdjustmentDto>(`/money/banks/${bankId}/adjustments/${adjustmentId}`, dto)
      .then((r) => r.data),

  deleteBankAdjustment: (
    adjustmentId: string,
    bankId: string,
  ): Promise<void> =>
    erpApi
      .delete(`/money/banks/${bankId}/adjustments/${adjustmentId}`)
      .then(() => undefined),

  getBankHistory: (bankId: string): Promise<BankHistoryDto> =>
    erpApi
      .get<BankHistoryDto>(`/money/banks/${bankId}/movements`)
      .then((r) => r.data),
};

export { CASH };