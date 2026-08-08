import type { BankCreateData, BankRecord, BankUpdateData } from "./bank.types";

export interface IBankRepository {
  findAll(companyId: string): Promise<BankRecord[]>;
  findById(id: string, companyId: string): Promise<BankRecord | null>;
  create(companyId: string, data: BankCreateData): Promise<BankRecord>;
  update(
    id: string,
    companyId: string,
    data: BankUpdateData,
  ): Promise<BankRecord>;
  delete(id: string, companyId: string): Promise<void>;
}