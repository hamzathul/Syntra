import type {
  AdjustmentDto,
  BankAdjustmentDto,
  MoneySalePaymentDto,
  TransferDto,
} from "shared";
import type {
  BankAdjustmentRecord,
  SalePaymentRecord,
  CashAdjustmentRecord,
  MoneyTransferNested,
} from "./money.types";

export function toAdjustmentDto(record: CashAdjustmentRecord): AdjustmentDto {
  return {
    id: record.id,
    companyId: record.companyId,
    type: record.type,
    amount: record.amount,
    date: record.date.toISOString(),
    description: record.description,
    image: null,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

export function toBankAdjustmentDto(
  record: BankAdjustmentRecord,
): BankAdjustmentDto {
  return {
    id: record.id,
    companyId: record.companyId,
    bankId: record.bankId,
    type: record.type,
    amount: record.amount,
    date: record.date.toISOString(),
    description: record.description,
    image: record.image,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

export function toTransferDto(record: MoneyTransferNested): TransferDto {
  return {
    id: record.id,
    companyId: record.companyId,
    fromBankId: record.fromBankId,
    toBankId: record.toBankId,
    date: record.date.toISOString(),
    amount: record.amount,
    description: record.description,
    image: record.image,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

export function toMoneySalePaymentDto(
  record: SalePaymentRecord,
): MoneySalePaymentDto {
  return {
    id: record.id,
    saleId: record.saleId,
    partyName: record.partyName,
    date: record.date.toISOString(),
    amount: record.amount,
    description: record.description,
  };
}
