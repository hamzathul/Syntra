import type { BankDto, CreateBankDto, UpdateBankDto } from "shared";

export interface IBankService {
  list(companyId: string): Promise<BankDto[]>;
  create(companyId: string, dto: CreateBankDto): Promise<BankDto>;
  update(
    id: string,
    companyId: string,
    dto: UpdateBankDto,
  ): Promise<BankDto>;
  remove(id: string, companyId: string): Promise<void>;
}