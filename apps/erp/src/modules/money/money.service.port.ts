import type {
  AdjustBankDto,
  AdjustCashDto,
  AdjustmentDto,
  BankAdjustmentDto,
  BankHistoryDto,
  CashSummaryDto,
  CreateTransferDto,
  TransferDto,
} from "shared";

export interface IMoneyService {
  getCashSummary(companyId: string): Promise<CashSummaryDto>;
  adjustCash(companyId: string, dto: AdjustCashDto): Promise<AdjustmentDto>;
  updateCashAdjustment(
    companyId: string,
    adjustmentId: string,
    dto: AdjustCashDto,
  ): Promise<AdjustmentDto>;
  deleteCashAdjustment(companyId: string, adjustmentId: string): Promise<void>;
  adjustBank(
    companyId: string,
    bankId: string,
    dto: AdjustBankDto,
  ): Promise<BankAdjustmentDto>;
  updateBankAdjustment(
    companyId: string,
    bankId: string,
    adjustmentId: string,
    dto: AdjustBankDto,
  ): Promise<BankAdjustmentDto>;
  deleteBankAdjustment(
    companyId: string,
    bankId: string,
    adjustmentId: string,
  ): Promise<void>;
  createTransfer(
    companyId: string,
    dto: CreateTransferDto,
  ): Promise<TransferDto>;
  updateTransfer(
    companyId: string,
    transferId: string,
    dto: CreateTransferDto,
  ): Promise<TransferDto>;
  deleteTransfer(companyId: string, transferId: string): Promise<void>;
  getBankHistory(companyId: string, bankId: string): Promise<BankHistoryDto>;
}