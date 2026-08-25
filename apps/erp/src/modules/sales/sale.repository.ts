import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  paginateResult,
} from "backend-p";
import type { DbClient } from "../../database/db-client";
import type {
  ISaleRepository,
  SaleListOptions,
} from "./sale.repository.port";
import type {
  PaymentCreateData,
  SaleCreateData,
  SaleRecord,
  SaleUpdateData,
} from "./sale.types";
import {
  toSaleRecord,
  toSaleRow,
  type SaleWithPartyRow,
} from "./sale.record";

const DEFAULT_LIST_LIMIT = 25;
const MAX_LIST_LIMIT = 100;

const SALE_INCLUDE = {
  party: { select: { name: true } },
  payments: {
    orderBy: { createdAt: "asc" as const },
    include: { cheque: true },
  },
};

interface PaymentDeltaRow {
  readonly mode: string;
  readonly amount: number;
  readonly bankId: string | null;
}

export class SaleRepository implements ISaleRepository {
  constructor(private readonly db: DbClient) {}

  async findAll(companyId: string, options?: SaleListOptions) {
    const limit = Math.min(options?.limit ?? DEFAULT_LIST_LIMIT, MAX_LIST_LIMIT);
    const rawSales = await this.db.sale.findMany({
      where: { companyId },
      take: limit + 1,
      ...(options?.cursor ? { cursor: { id: options.cursor }, skip: 1 } : {}),
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      include: SALE_INCLUDE,
    });
    return paginateResult(
      rawSales.map((sale) =>
        toSaleRecord(toSaleRow(sale as unknown as SaleWithPartyRow)),
      ),
      limit,
      options?.cursor,
    );
  }

  async findById(id: string, companyId: string): Promise<SaleRecord | null> {
    const sale = await this.db.sale.findUnique({
      where: { id },
      include: SALE_INCLUDE,
    });
    if (!sale || sale.companyId !== companyId) return null;
    return toSaleRecord(toSaleRow(sale as unknown as SaleWithPartyRow));
  }

  async create(companyId: string, data: SaleCreateData): Promise<SaleRecord> {
    const created = await this.db.$transaction(async (tx) => {
      const sale = await tx.sale.create({
        data: {
          companyId,
          partyId: data.partyId,
          saleType: data.saleType,
          saleDate: data.saleDate,
          totalAmount: data.totalAmount,
          receivedAmount: data.receivedAmount,
          description: data.description ?? null,
          image: data.image ?? null,
          document: data.document ?? null,
        },
      });

      await this.replacePayments(tx, companyId, sale.id, data.payments);
      await this.applyPaymentDeltas(tx, companyId, data.payments);

      return tx.sale.findUnique({
        where: { id: sale.id },
        include: SALE_INCLUDE,
      });
    });

    return toSaleRecord(toSaleRow(created as unknown as SaleWithPartyRow));
  }

  async update(
    id: string,
    companyId: string,
    data: SaleUpdateData,
  ): Promise<SaleRecord> {
    const updated = await this.db.$transaction(async (tx) => {
      const existing = await tx.sale.findFirst({
        where: { id, companyId },
        include: { payments: { include: { cheque: true } } },
      });
      if (!existing) throw new NotFoundError("Sale");

      if (data.payments) {
        if (data.receivedAmount === undefined) {
          throw new BadRequestError(
            "receivedAmount must be supplied when payments are provided",
          );
        }

        const locked = existing.payments.some(
          (payment) => payment.cheque && payment.cheque.status !== "RECEIVED",
        );
        if (locked) {
          throw new ConflictError(
            "Payments cannot be changed because a cheque on this sale has already been deposited or bounced",
          );
        }

        await this.revertPaymentDeltas(tx, companyId, existing.payments);
        await tx.salePayment.deleteMany({ where: { saleId: id } });
        await this.replacePayments(tx, companyId, id, data.payments);
        await this.applyPaymentDeltas(tx, companyId, data.payments);
      }

      return tx.sale.update({
        where: { id },
        data: {
          partyId: data.partyId,
          saleDate: data.saleDate,
          totalAmount: data.totalAmount,
          receivedAmount: data.receivedAmount,
          description: data.description,
          image: data.image,
          document: data.document,
        },
        include: SALE_INCLUDE,
      });
    });

    return toSaleRecord(toSaleRow(updated as unknown as SaleWithPartyRow));
  }

  async delete(id: string, companyId: string): Promise<void> {
    await this.db.$transaction(async (tx) => {
      const existing = await tx.sale.findFirst({
        where: { id, companyId },
        include: { payments: { include: { cheque: true } } },
      });
      if (!existing) throw new NotFoundError("Sale");

      const locked = existing.payments.some(
        (payment) => payment.cheque && payment.cheque.status !== "RECEIVED",
      );
      if (locked) {
        throw new ConflictError(
          "This sale cannot be deleted because a cheque on it has already been deposited or bounced",
        );
      }

      await this.revertPaymentDeltas(tx, companyId, existing.payments);
      await tx.sale.delete({ where: { id } });
    });
  }

  async partyExists(companyId: string, partyId: string): Promise<boolean> {
    const count = await this.db.party.count({
      where: { id: partyId, companyId },
    });
    return count > 0;
  }

  async banksExist(companyId: string, bankIds: string[]): Promise<boolean> {
    if (bankIds.length === 0) return true;
    const uniqueIds = [...new Set(bankIds)];
    const count = await this.db.bank.count({
      where: { id: { in: uniqueIds }, companyId },
    });
    return count === uniqueIds.length;
  }

  private async replacePayments(
    tx: DbClient,
    companyId: string,
    saleId: string,
    payments: PaymentCreateData[],
  ): Promise<void> {
    for (const payment of payments) {
      const created = await tx.salePayment.create({
        data: {
          saleId,
          companyId,
          mode: payment.mode,
          amount: payment.amount,
          bankId: payment.bankId ?? null,
          description: payment.description ?? null,
        },
      });

      if (payment.cheque) {
        await tx.cheque.create({
          data: {
            companyId,
            salePaymentId: created.id,
            saleId,
            drawBankName: payment.cheque.drawBankName,
            chequeNumber: payment.cheque.chequeNumber,
            chequeDate: payment.cheque.chequeDate,
            amount: payment.amount,
            notes: payment.cheque.notes ?? null,
            image: payment.cheque.image ?? null,
          },
        });
      }
    }
  }

  private async applyPaymentDeltas(
    tx: DbClient,
    companyId: string,
    payments: PaymentCreateData[],
  ): Promise<void> {
    for (const payment of payments) {
      if (payment.mode === "CASH") {
        await this.applyCashDelta(tx, companyId, payment.amount);
      } else if (payment.mode === "BANK" && payment.bankId) {
        const { count } = await tx.bank.updateMany({
          where: { id: payment.bankId, companyId },
          data: { currentBalance: { increment: payment.amount } },
        });
        if (count === 0) throw new NotFoundError("Bank");
      }
    }
  }

  private async revertPaymentDeltas(
    tx: DbClient,
    companyId: string,
    payments: PaymentDeltaRow[],
  ): Promise<void> {
    for (const payment of payments) {
      const amount = Number(payment.amount);
      if (payment.mode === "CASH") {
        await this.applyCashDelta(tx, companyId, -amount);
      } else if (payment.mode === "BANK" && payment.bankId) {
        const { count } = await tx.bank.updateMany({
          where: { id: payment.bankId, companyId },
          data: { currentBalance: { decrement: amount } },
        });
        if (count === 0) throw new NotFoundError("Bank");
      }
    }
  }

  private async applyCashDelta(
    tx: DbClient,
    companyId: string,
    delta: number,
  ): Promise<void> {
    await tx.cashAccount.upsert({
      where: { companyId },
      create: { companyId, currentBalance: 0 },
      update: {},
    });
    await tx.cashAccount.update({
      where: { companyId },
      data: { currentBalance: { increment: delta } },
    });
  }
}
