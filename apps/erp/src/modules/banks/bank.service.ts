import {
  ConflictError,
  NotFoundError,
  isPrismaUniqueViolation,
  type LoggerPort,
} from "backend-p";
import type { BankDto, CreateBankDto, UpdateBankDto } from "shared";
import type { IBankRepository } from "./bank.repository.port";
import type { IBankService } from "./bank.service.port";
import type { BankCreateData, BankUpdateData } from "./bank.types";
import { toBankDto } from "./bank.mapper";

const UPDATE_FIELDS = [
  "name",
  "openingBalance",
  "printBankDetails",
  "accountHolderName",
  "accountNumber",
  "ifscCode",
  "branchName",
  "printUpiQr",
  "upiId",
] as const;

export class BankService implements IBankService {
  constructor(
    private readonly repo: IBankRepository,
    private readonly logger: LoggerPort,
  ) {}

  async list(companyId: string): Promise<BankDto[]> {
    const records = await this.repo.findAll(companyId);
    return records.map(toBankDto);
  }

  async create(companyId: string, dto: CreateBankDto): Promise<BankDto> {
    let record;
    try {
      record = await this.repo.create(companyId, this.toCreateData(dto));
    } catch (error) {
      if (isPrismaUniqueViolation(error)) {
        throw new ConflictError("A bank with this name already exists");
      }
      throw error;
    }

    this.logger.info(
      {
        category: "audit",
        action: "bank.created",
        companyId,
        bankId: record.id,
      },
      "Bank created",
    );

    return toBankDto(record);
  }

  async update(
    id: string,
    companyId: string,
    dto: UpdateBankDto,
  ): Promise<BankDto> {
    const existing = await this.repo.findById(id, companyId);
    if (!existing) throw new NotFoundError("Bank");

    let data = this.toUpdateData(dto);

    if (dto.openingBalance !== undefined) {
      const nextOpening = dto.openingBalance;
      const currentOpening = existing.openingBalance;
      if (nextOpening !== currentOpening) {
        if (await this.repo.hasMovements(id, companyId)) {
          throw new ConflictError(
            "Opening balance can no longer be changed after a bank has movements. Use Adjust Bank Balance instead.",
          );
        }
        const openingDelta = (nextOpening ?? 0) - (currentOpening ?? 0);
        data = { ...data, currentBalanceIncrement: openingDelta };
      }
    }

    let record;
    try {
      record = await this.repo.update(id, companyId, data);
    } catch (error) {
      if (isPrismaUniqueViolation(error)) {
        throw new ConflictError("A bank with this name already exists");
      }
      throw error;
    }

    this.logger.info(
      {
        category: "audit",
        action: "bank.updated",
        companyId,
        bankId: id,
      },
      "Bank updated",
    );

    return toBankDto(record);
  }

  async remove(id: string, companyId: string): Promise<void> {
    const existing = await this.repo.findById(id, companyId);
    if (!existing) throw new NotFoundError("Bank");

    await this.repo.delete(id, companyId);

    this.logger.info(
      {
        category: "audit",
        action: "bank.deleted",
        companyId,
        bankId: id,
      },
      "Bank deleted",
    );
  }

  private toCreateData(dto: CreateBankDto): BankCreateData {
    return {
      name: dto.name,
      openingBalance: dto.openingBalance,
      openingBalanceDate: dto.openingBalanceDate
        ? new Date(dto.openingBalanceDate)
        : null,
      printBankDetails: dto.printBankDetails,
      accountHolderName: dto.accountHolderName,
      accountNumber: dto.accountNumber,
      ifscCode: dto.ifscCode,
      branchName: dto.branchName,
      printUpiQr: dto.printUpiQr,
      upiId: dto.upiId,
    };
  }

  private toUpdateData(dto: UpdateBankDto): BankUpdateData {
    const data: Record<string, unknown> = {};
    for (const field of UPDATE_FIELDS) {
      if (dto[field] !== undefined) {
        data[field] = dto[field];
      }
    }
    if (dto.openingBalanceDate !== undefined) {
      data.openingBalanceDate = dto.openingBalanceDate
        ? new Date(dto.openingBalanceDate)
        : null;
    }
    return data as BankUpdateData;
  }
}