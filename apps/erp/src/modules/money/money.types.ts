import type { AdjustmentType } from "shared";

export interface MoneyTransferNested {
  readonly id: string;
  readonly companyId: string;
  readonly date: Date;
  readonly amount: number;
  readonly fromBankId: string | null;
  readonly toBankId: string | null;
  readonly description: string | null;
  readonly image: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly fromBank: { readonly name: string } | null;
  readonly toBank: { readonly name: string } | null;
}

export interface CashAdjustmentRecord {
  readonly id: string;
  readonly companyId: string;
  readonly date: Date;
  readonly type: AdjustmentType;
  readonly amount: number;
  readonly description: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface BankAdjustmentRecord {
  readonly id: string;
  readonly companyId: string;
  readonly bankId: string;
  readonly bankName: string | null;
  readonly date: Date;
  readonly type: AdjustmentType;
  readonly amount: number;
  readonly description: string | null;
  readonly image: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface TransferCreateData {
  readonly date: Date;
  readonly amount: number;
  readonly fromBankId: string | null;
  readonly toBankId: string | null;
  readonly description?: string | null;
  readonly image?: string | null;
}