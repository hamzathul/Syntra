import type { SaleDto } from "shared";
import type { SaleRecord } from "./sale.types";

export function toSaleDto(record: SaleRecord): SaleDto {
  const balanceDue = record.totalAmount - record.receivedAmount;
  return {
    id: record.id,
    companyId: record.companyId,
    partyId: record.partyId,
    partyName: record.partyName,
    saleType: record.saleType,
    saleDate: record.saleDate.toISOString(),
    totalAmount: record.totalAmount,
    receivedAmount: record.receivedAmount,
    balanceDue,
    paid: balanceDue <= 0.00001,
    description: record.description,
    image: record.image,
    document: record.document,
    payments: record.payments.map((payment) => ({
      id: payment.id,
      saleId: payment.saleId,
      mode: payment.mode,
      amount: payment.amount,
      bankId: payment.bankId,
      description: payment.description,
      cheque: payment.cheque
        ? {
            id: payment.cheque.id,
            salePaymentId: payment.cheque.salePaymentId,
            saleId: payment.cheque.saleId,
            drawBankName: payment.cheque.drawBankName,
            chequeNumber: payment.cheque.chequeNumber,
            chequeDate: payment.cheque.chequeDate.toISOString(),
            amount: payment.cheque.amount,
            status: payment.cheque.status,
            depositBankId: payment.cheque.depositBankId,
            depositedAt: payment.cheque.depositedAt
              ? payment.cheque.depositedAt.toISOString()
              : null,
            notes: payment.cheque.notes,
            image: payment.cheque.image,
            createdAt: payment.cheque.createdAt.toISOString(),
            updatedAt: payment.cheque.updatedAt.toISOString(),
          }
        : null,
      createdAt: payment.createdAt.toISOString(),
    })),
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}
