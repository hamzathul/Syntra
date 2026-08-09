import { NotFoundError } from "backend-p";
import type { DbClient } from "../../database/db-client";
import type { IBankRepository } from "./bank.repository.port";
import type { BankCreateData, BankRecord, BankUpdateData } from "./bank.types";
import { toBankRecord, type BankRow } from "./bank.record";

export class BankRepository implements IBankRepository {
  constructor(private readonly db: DbClient) {}

  async findAll(companyId: string): Promise<BankRecord[]> {
    const banks = await this.db.bank.findMany({
      where: { companyId },
      orderBy: { name: "asc" },
    });
    return banks.map((bank) => toBankRecord(bank as unknown as BankRow));
  }

  async findById(id: string, companyId: string): Promise<BankRecord | null> {
    const bank = await this.db.bank.findUnique({ where: { id } });
    if (!bank || bank.companyId !== companyId) return null;
    return toBankRecord(bank as unknown as BankRow);
  }

  async create(companyId: string, data: BankCreateData): Promise<BankRecord> {
    const bank = await this.db.bank.create({
      data: {
        ...data,
        companyId,
        currentBalance: data.openingBalance ?? 0,
      },
    });
    return toBankRecord(bank as unknown as BankRow);
  }

  async update(
    id: string,
    companyId: string,
    data: BankUpdateData,
  ): Promise<BankRecord> {
    const { count } = await this.db.bank.updateMany({
      where: { id, companyId },
      data,
    });
    if (count === 0) throw new NotFoundError("Bank");

    const bank = await this.db.bank.findUnique({ where: { id } });
    return toBankRecord(bank as unknown as BankRow);
  }

  async delete(id: string, companyId: string): Promise<void> {
    const { count } = await this.db.bank.deleteMany({
      where: { id, companyId },
    });
    if (count === 0) throw new NotFoundError("Bank");
  }

  async hasMovements(bankId: string, companyId: string): Promise<boolean> {
    const [adjustmentCount, transferCount] = await Promise.all([
      this.db.bankAdjustment.count({ where: { bankId, companyId } }),
      this.db.moneyTransfer.count({
        where: {
          companyId,
          OR: [{ fromBankId: bankId }, { toBankId: bankId }],
        },
      }),
    ]);
    return adjustmentCount > 0 || transferCount > 0;
  }
}