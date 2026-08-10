import type { AdjustmentType } from "shared";
import type {
  BankAdjustmentRecord,
  CashAdjustmentRecord,
  MoneyTransferNested,
} from "./money.types";

export interface CashAdjustmentRow {
  readonly id: string;
  readonly companyId: string;
  readonly date: Date;
  readonly type: string;
  readonly amount: number;
  readonly description: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface BankAdjustmentRow {
  readonly id: string;
  readonly companyId: string;
  readonly bankId: string;
  readonly bankName: string | null;
  readonly date: Date;
  readonly type: string;
  readonly amount: number;
  readonly description: string | null;
  readonly image: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export function toCashAdjustmentRecord(row: CashAdjustmentRow): CashAdjustmentRecord {
  return {
    id: row.id,
    companyId: row.companyId,
    date: row.date,
    type: row.type as AdjustmentType,
    amount: Number(row.amount),
    description: row.description,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export function toBankAdjustmentRecord(row: BankAdjustmentRow): BankAdjustmentRecord {
  return {
    id: row.id,
    companyId: row.companyId,
    bankId: row.bankId,
    bankName: row.bankName ?? null,
    date: row.date,
    type: row.type as AdjustmentType,
    amount: Number(row.amount),
    description: row.description,
    image: row.image ?? null,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export function toTransferRecord(row: {
  id: string;
  companyId: string;
  date: Date;
  amount: number;
  fromBankId: string | null;
  toBankId: string | null;
  description: string | null;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
  fromBank: { name: string } | null;
  toBank: { name: string } | null;
}): MoneyTransferNested {
  return {
    id: row.id,
    companyId: row.companyId,
    date: row.date,
    amount: Number(row.amount),
    fromBankId: row.fromBankId,
    toBankId: row.toBankId,
    description: row.description,
    image: row.image,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    fromBank: row.fromBank,
    toBank: row.toBank,
  };
}