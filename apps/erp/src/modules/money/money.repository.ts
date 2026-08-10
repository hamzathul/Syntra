import type { AdjustmentType } from "shared";
import type { DbClient } from "../../database/db-client";
import type {
  IMoneyRepository,
  TransferUpdateData,
} from "./money.repository.port";
import {
  toBankAdjustmentRecord,
  toCashAdjustmentRecord,
  toTransferRecord,
} from "./money.record";
import type {
  BankAdjustmentRecord,
  CashAdjustmentRecord,
  MoneyTransferNested,
  TransferCreateData,
} from "./money.types";

const TRANSFER_INCLUDE = {
  fromBank: { select: { name: true } },
  toBank: { select: { name: true } },
};

export class MoneyRepository implements IMoneyRepository {
  constructor(private readonly db: DbClient) {}

  async getCashBalance(companyId: string): Promise<number> {
    const account = await this.db.cashAccount.findUnique({
      where: { companyId },
      select: { currentBalance: true },
    });
    return account ? Number(account.currentBalance) : 0;
  }

  async getBankBalance(bankId: string): Promise<number> {
    const bank = await this.db.bank.findUnique({
      where: { id: bankId },
      select: { currentBalance: true },
    });
    return bank ? Number(bank.currentBalance) : 0;
  }

  async findBank(bankId: string, companyId: string): Promise<{ id: string } | null> {
    return this.db.bank.findFirst({
      where: { id: bankId, companyId },
      select: { id: true },
    });
  }

  async createCashAdjustment(
    companyId: string,
    data: {
      date: Date;
      type: AdjustmentType;
      amount: number;
      description?: string | null;
    },
  ): Promise<CashAdjustmentRecord> {
    const signed = data.type === "INCREASE" ? data.amount : -data.amount;

    const created = await this.db.$transaction(async (tx) => {
      await tx.cashAccount.upsert({
        where: { companyId },
        create: { companyId, currentBalance: 0 },
        update: {},
      });
      await tx.cashAccount.update({
        where: { companyId },
        data: { currentBalance: { increment: signed } },
      });
      return tx.cashAdjustment.create({
        data: {
          companyId,
          date: data.date,
          type: data.type,
          amount: data.amount,
          description: data.description ?? null,
        },
      });
    });

    return toCashAdjustmentRecord(created as never);
  }

  async createBankAdjustment(
    companyId: string,
    data: {
      bankId: string;
      date: Date;
      type: AdjustmentType;
      amount: number;
      description?: string | null;
      image?: string | null;
    },
  ): Promise<BankAdjustmentRecord> {
    const signed = data.type === "INCREASE" ? data.amount : -data.amount;

    const adjustment = await this.db.$transaction(async (tx) => {
      const created = await tx.bankAdjustment.create({
        data: {
          companyId,
          bankId: data.bankId,
          date: data.date,
          type: data.type,
          amount: data.amount,
          description: data.description ?? null,
          image: data.image ?? null,
        },
      });
      await tx.bank.update({
        where: { id: data.bankId },
        data: { currentBalance: { increment: signed } },
      });
      return created;
    });

    return toBankAdjustmentRecord(adjustment as never);
  }

  async createTransfer(
    companyId: string,
    data: TransferCreateData,
  ): Promise<MoneyTransferNested> {
    const transfer = await this.db.$transaction(async (tx) => {
      const created = await tx.moneyTransfer.create({
        data: {
          companyId,
          date: data.date,
          amount: data.amount,
          fromBankId: data.fromBankId,
          toBankId: data.toBankId,
          description: data.description ?? null,
          image: data.image ?? null,
        },
        include: TRANSFER_INCLUDE,
      });

      await this.applyBalanceDeltas(tx, companyId, {
        fromBankId: data.fromBankId,
        toBankId: data.toBankId,
        amount: data.amount,
      });

      return created;
    });

    return toTransferRecord(transfer as never);
  }

  async updateCashAdjustment(
    companyId: string,
    adjustmentId: string,
    data: { date: Date; type: AdjustmentType; amount: number; description?: string | null },
  ): Promise<CashAdjustmentRecord | null> {
    const updated = await this.db.$transaction(async (tx) => {
      const existing = await tx.cashAdjustment.findFirst({
        where: { id: adjustmentId, companyId },
      });
      if (!existing) return null;

      const oldSigned =
        existing.type === "INCREASE"
          ? Number(existing.amount)
          : -Number(existing.amount);
      const newSigned = data.type === "INCREASE" ? data.amount : -data.amount;

      await tx.cashAccount.update({
        where: { companyId },
        data: { currentBalance: { increment: newSigned - oldSigned } },
      });
      return tx.cashAdjustment.update({
        where: { id: adjustmentId },
        data: {
          date: data.date,
          type: data.type,
          amount: data.amount,
          description: data.description ?? null,
        },
      });
    });

    if (!updated) return null;
    return toCashAdjustmentRecord(updated as never);
  }

  async deleteCashAdjustment(
    companyId: string,
    adjustmentId: string,
  ): Promise<boolean> {
    const deleted = await this.db.$transaction(async (tx) => {
      const existing = await tx.cashAdjustment.findFirst({
        where: { id: adjustmentId, companyId },
      });
      if (!existing) return null;

      const signed =
        existing.type === "INCREASE"
          ? Number(existing.amount)
          : -Number(existing.amount);

      await tx.cashAccount.update({
        where: { companyId },
        data: { currentBalance: { decrement: signed } },
      });
      await tx.cashAdjustment.delete({ where: { id: adjustmentId } });
      return true;
    });

    return deleted !== null;
  }

  async updateBankAdjustment(
    companyId: string,
    bankId: string,
    adjustmentId: string,
    data: {
      date: Date;
      type: AdjustmentType;
      amount: number;
      description?: string | null;
      image?: string | null;
    },
  ): Promise<BankAdjustmentRecord | null> {
    const result = await this.db.$transaction(async (tx) => {
      const existing = await tx.bankAdjustment.findFirst({
        where: { id: adjustmentId, companyId, bankId },
        include: { bank: { select: { name: true } } },
      });
      if (!existing || !existing.bank) return null;

      const oldSigned =
        existing.type === "INCREASE"
          ? Number(existing.amount)
          : -Number(existing.amount);
      const newSigned = data.type === "INCREASE" ? data.amount : -data.amount;

      await tx.bank.update({
        where: { id: bankId },
        data: { currentBalance: { increment: newSigned - oldSigned } },
      });
      const updated = await tx.bankAdjustment.update({
        where: { id: adjustmentId },
        data: {
          date: data.date,
          type: data.type,
          amount: data.amount,
          description: data.description ?? null,
          image: data.image ?? null,
        },
      });
      return { updated, bankName: existing.bank.name };
    });

    if (!result) return null;
    return toBankAdjustmentRecord({
      ...result.updated,
      bankName: result.bankName,
    } as never);
  }

  async deleteBankAdjustment(
    companyId: string,
    bankId: string,
    adjustmentId: string,
  ): Promise<boolean> {
    const deleted = await this.db.$transaction(async (tx) => {
      const existing = await tx.bankAdjustment.findFirst({
        where: { id: adjustmentId, companyId, bankId },
      });
      if (!existing) return null;

      const signed =
        existing.type === "INCREASE"
          ? Number(existing.amount)
          : -Number(existing.amount);

      await tx.bank.update({
        where: { id: bankId },
        data: { currentBalance: { decrement: signed } },
      });
      await tx.bankAdjustment.delete({ where: { id: adjustmentId } });
      return true;
    });

    return deleted !== null;
  }

  async updateTransfer(
    companyId: string,
    transferId: string,
    data: TransferUpdateData,
  ): Promise<MoneyTransferNested | null> {
    const updated = await this.db.$transaction(async (tx) => {
      const existing = await tx.moneyTransfer.findFirst({
        where: { id: transferId, companyId },
        include: TRANSFER_INCLUDE,
      });
      if (!existing) return null;

      await this.revertBalanceDeltas(tx, companyId, {
        fromBankId: existing.fromBankId,
        toBankId: existing.toBankId,
        amount: Number(existing.amount),
      });
      await this.applyBalanceDeltas(tx, companyId, {
        fromBankId: data.fromBankId,
        toBankId: data.toBankId,
        amount: data.amount,
      });
      return tx.moneyTransfer.update({
        where: { id: transferId },
        data: {
          date: data.date,
          amount: data.amount,
          fromBankId: data.fromBankId,
          toBankId: data.toBankId,
          description: data.description ?? null,
          image: data.image ?? null,
        },
        include: TRANSFER_INCLUDE,
      });
    });

    if (!updated) return null;
    return toTransferRecord(updated as never);
  }

  async deleteTransfer(companyId: string, transferId: string): Promise<boolean> {
    const deleted = await this.db.$transaction(async (tx) => {
      const existing = await tx.moneyTransfer.findFirst({
        where: { id: transferId, companyId },
      });
      if (!existing) return null;

      await this.revertBalanceDeltas(tx, companyId, {
        fromBankId: existing.fromBankId,
        toBankId: existing.toBankId,
        amount: Number(existing.amount),
      });
      await tx.moneyTransfer.delete({ where: { id: transferId } });
      return true;
    });

    return deleted !== null;
  }

  private async applyBalanceDeltas(
    tx: DbClient,
    companyId: string,
    deltas: { fromBankId: string | null; toBankId: string | null; amount: number },
  ): Promise<void> {
    if (deltas.fromBankId === null) {
      await this.applyCashDelta(tx, companyId, -deltas.amount);
    } else {
      await tx.bank.update({
        where: { id: deltas.fromBankId },
        data: { currentBalance: { decrement: deltas.amount } },
      });
    }

    if (deltas.toBankId === null) {
      await this.applyCashDelta(tx, companyId, deltas.amount);
    } else {
      await tx.bank.update({
        where: { id: deltas.toBankId },
        data: { currentBalance: { increment: deltas.amount } },
      });
    }
  }

  private async revertBalanceDeltas(
    tx: DbClient,
    companyId: string,
    deltas: { fromBankId: string | null; toBankId: string | null; amount: number },
  ): Promise<void> {
    if (deltas.fromBankId === null) {
      await this.applyCashDelta(tx, companyId, deltas.amount);
    } else {
      await tx.bank.update({
        where: { id: deltas.fromBankId },
        data: { currentBalance: { increment: deltas.amount } },
      });
    }

    if (deltas.toBankId === null) {
      await this.applyCashDelta(tx, companyId, -deltas.amount);
    } else {
      await tx.bank.update({
        where: { id: deltas.toBankId },
        data: { currentBalance: { decrement: deltas.amount } },
      });
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

  async listCashAdjustments(
    companyId: string,
    limit: number,
  ): Promise<CashAdjustmentRecord[]> {
    const rows = await this.db.cashAdjustment.findMany({
      where: { companyId },
      orderBy: { date: "desc" },
      take: limit,
    });
    return rows.map((row) => toCashAdjustmentRecord(row as never));
  }

  async listBankAdjustments(
    companyId: string,
    bankId: string | null,
    limit: number,
  ): Promise<BankAdjustmentRecord[]> {
    const rows = await this.db.bankAdjustment.findMany({
      where: { companyId, ...(bankId ? { bankId } : {}) },
      orderBy: { date: "desc" },
      take: limit,
      include: { bank: { select: { name: true } } },
    });
    return rows.map((row) =>
      toBankAdjustmentRecord({
        id: row.id,
        companyId: row.companyId,
        bankId: row.bankId,
        bankName: row.bank?.name ?? null,
        date: row.date,
        type: row.type,
        amount: row.amount,
        description: row.description,
        image: row.image,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      } as never),
    );
  }

  async listCashTransfers(
    companyId: string,
    limit: number,
  ): Promise<MoneyTransferNested[]> {
    const rows = await this.db.moneyTransfer.findMany({
      where: { companyId, OR: [{ fromBankId: null }, { toBankId: null }] },
      orderBy: { date: "desc" },
      take: limit,
      include: TRANSFER_INCLUDE,
    });
    return rows.map((row) => toTransferRecord(row as never));
  }

  async listBankTransfers(
    companyId: string,
    bankId: string | null,
    limit: number,
  ): Promise<MoneyTransferNested[]> {
    const rows = await this.db.moneyTransfer.findMany({
      where: {
        companyId,
        ...(bankId
          ? { OR: [{ fromBankId: bankId }, { toBankId: bankId }] }
          : {}),
      },
      orderBy: { date: "desc" },
      take: limit,
      include: TRANSFER_INCLUDE,
    });
    return rows.map((row) => toTransferRecord(row as never));
  }
}