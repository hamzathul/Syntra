import type { AdjustmentType } from "shared";
import type {
  BankAdjustmentRecord,
  CashAdjustmentRecord,
  MoneyTransferNested,
  TransferCreateData,
} from "./money.types";

export interface CashAdjustmentUpdateData {
  date: Date;
  type: AdjustmentType;
  amount: number;
  description?: string | null;
}

export interface BankAdjustmentUpdateData extends CashAdjustmentUpdateData {
  image?: string | null;
}

export interface TransferUpdateData {
  date: Date;
  amount: number;
  fromBankId: string | null;
  toBankId: string | null;
  description?: string | null;
  image?: string | null;
}

export interface IMoneyRepository {
  getCashBalance(companyId: string): Promise<number>;
  getBankBalance(bankId: string): Promise<number>;
  findBank(bankId: string, companyId: string): Promise<{ id: string } | null>;
  createCashAdjustment(
    companyId: string,
    data: { date: Date; type: AdjustmentType; amount: number; description?: string | null },
  ): Promise<CashAdjustmentRecord>;
  createBankAdjustment(
    companyId: string,
    data: {
      bankId: string;
      date: Date;
      type: AdjustmentType;
      amount: number;
      description?: string | null;
      image?: string | null;
    },
  ): Promise<BankAdjustmentRecord>;
  createTransfer(
    companyId: string,
    data: TransferCreateData,
  ): Promise<MoneyTransferNested>;
  updateCashAdjustment(
    companyId: string,
    adjustmentId: string,
    data: CashAdjustmentUpdateData,
  ): Promise<CashAdjustmentRecord | null>;
  deleteCashAdjustment(companyId: string, adjustmentId: string): Promise<boolean>;
  updateBankAdjustment(
    companyId: string,
    bankId: string,
    adjustmentId: string,
    data: BankAdjustmentUpdateData,
  ): Promise<BankAdjustmentRecord | null>;
  deleteBankAdjustment(
    companyId: string,
    bankId: string,
    adjustmentId: string,
  ): Promise<boolean>;
  updateTransfer(
    companyId: string,
    transferId: string,
    data: TransferUpdateData,
  ): Promise<MoneyTransferNested | null>;
  deleteTransfer(companyId: string, transferId: string): Promise<boolean>;
  listCashAdjustments(companyId: string, limit: number): Promise<CashAdjustmentRecord[]>;
  listBankAdjustments(
    companyId: string,
    bankId: string | null,
    limit: number,
  ): Promise<BankAdjustmentRecord[]>;
  listCashTransfers(companyId: string, limit: number): Promise<MoneyTransferNested[]>;
  listBankTransfers(
    companyId: string,
    bankId: string | null,
    limit: number,
  ): Promise<MoneyTransferNested[]>;
}