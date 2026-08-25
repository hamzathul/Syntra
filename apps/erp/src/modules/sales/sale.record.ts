import type {
  ChequeRecord,
  SalePaymentRecord,
  SaleRecord,
} from "./sale.types";

export interface ChequeRow {
  readonly id: string;
  readonly salePaymentId: string;
  readonly saleId: string;
  readonly drawBankName: string;
  readonly chequeNumber: string;
  readonly chequeDate: Date;
  readonly amount: number;
  readonly status: string;
  readonly depositBankId: string | null;
  readonly depositedAt: Date | null;
  readonly notes: string | null;
  readonly image: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface SalePaymentRow {
  readonly id: string;
  readonly saleId: string;
  readonly mode: string;
  readonly amount: number;
  readonly bankId: string | null;
  readonly description: string | null;
  readonly cheque: ChequeRow | null;
  readonly createdAt: Date;
}

export interface SaleRow {
  readonly id: string;
  readonly companyId: string;
  readonly partyId: string;
  readonly partyName: string;
  readonly saleType: string;
  readonly saleDate: Date;
  readonly totalAmount: number;
  readonly receivedAmount: number;
  readonly description: string | null;
  readonly image: string | null;
  readonly document: string | null;
  readonly payments: SalePaymentRow[];
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface SaleWithPartyRow {
  readonly id: string;
  readonly companyId: string;
  readonly partyId: string;
  readonly partyName?: string;
  readonly saleType: string;
  readonly saleDate: Date;
  readonly totalAmount: number;
  readonly receivedAmount: number;
  readonly description: string | null;
  readonly image: string | null;
  readonly document: string | null;
  readonly payments: SalePaymentRow[];
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly party?: { readonly name: string } | null;
}

export function toSaleRow(row: SaleWithPartyRow): SaleRow {
  return {
    ...row,
    partyName: row.partyName ?? row.party?.name ?? "",
  };
}

export function toChequeRecord(row: ChequeRow): ChequeRecord {
  return {
    id: row.id,
    salePaymentId: row.salePaymentId,
    saleId: row.saleId,
    drawBankName: row.drawBankName,
    chequeNumber: row.chequeNumber,
    chequeDate: row.chequeDate,
    amount: Number(row.amount),
    status: row.status as ChequeRecord["status"],
    depositBankId: row.depositBankId,
    depositedAt: row.depositedAt,
    notes: row.notes,
    image: row.image,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export function toSalePaymentRecord(row: SalePaymentRow): SalePaymentRecord {
  return {
    id: row.id,
    saleId: row.saleId,
    mode: row.mode as SalePaymentRecord["mode"],
    amount: Number(row.amount),
    bankId: row.bankId,
    description: row.description,
    cheque: row.cheque ? toChequeRecord(row.cheque) : null,
    createdAt: row.createdAt,
  };
}

export function toSaleRecord(row: SaleRow): SaleRecord {
  return {
    id: row.id,
    companyId: row.companyId,
    partyId: row.partyId,
    partyName: row.partyName,
    saleType: row.saleType as SaleRecord["saleType"],
    saleDate: row.saleDate,
    totalAmount: Number(row.totalAmount),
    receivedAmount: Number(row.receivedAmount),
    description: row.description,
    image: row.image,
    document: row.document,
    payments: row.payments.map(toSalePaymentRecord),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}
