import type { ChequeStatus, PaymentMode, SaleType } from "shared";

export interface ChequeRecord {
  readonly id: string;
  readonly salePaymentId: string;
  readonly saleId: string;
  readonly drawBankName: string;
  readonly chequeNumber: string;
  readonly chequeDate: Date;
  readonly amount: number;
  readonly status: ChequeStatus;
  readonly depositBankId: string | null;
  readonly depositedAt: Date | null;
  readonly notes: string | null;
  readonly image: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface SalePaymentRecord {
  readonly id: string;
  readonly saleId: string;
  readonly mode: PaymentMode;
  readonly amount: number;
  readonly bankId: string | null;
  readonly description: string | null;
  readonly cheque: ChequeRecord | null;
  readonly createdAt: Date;
}

export interface SaleRecord {
  readonly id: string;
  readonly companyId: string;
  readonly partyId: string;
  readonly partyName: string;
  readonly saleType: SaleType;
  readonly saleDate: Date;
  readonly totalAmount: number;
  readonly receivedAmount: number;
  readonly description: string | null;
  readonly image: string | null;
  readonly document: string | null;
  readonly payments: SalePaymentRecord[];
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface ChequeCreateData {
  readonly drawBankName: string;
  readonly chequeNumber: string;
  readonly chequeDate: Date;
  readonly notes?: string | null;
  readonly image?: string | null;
}

export interface PaymentCreateData {
  readonly mode: PaymentMode;
  readonly amount: number;
  readonly bankId?: string | null;
  readonly description?: string | null;
  readonly cheque?: ChequeCreateData | null;
}

export interface SaleCreateData {
  readonly partyId: string;
  readonly saleType: SaleType;
  readonly saleDate: Date;
  readonly totalAmount: number;
  readonly receivedAmount: number;
  readonly description?: string | null;
  readonly image?: string | null;
  readonly document?: string | null;
  readonly payments: PaymentCreateData[];
}

export interface SaleUpdateData {
  readonly partyId?: string;
  readonly saleDate?: Date;
  readonly totalAmount?: number;
  readonly receivedAmount?: number;
  readonly description?: string | null;
  readonly image?: string | null;
  readonly document?: string | null;
  readonly payments?: PaymentCreateData[];
}
