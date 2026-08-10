import { NotFoundError, type LoggerPort } from "backend-p";
import {
  CASH,
  type AdjustBankDto,
  type AdjustCashDto,
  type AdjustmentDto,
  type BankAdjustmentDto,
  type BankHistoryDto,
  type CashSummaryDto,
  type CreateTransferDto,
  type TransferDto,
} from "shared";
import type { IMoneyRepository } from "./money.repository.port";
import type { IMoneyService } from "./money.service.port";
import {
  toAdjustmentDto,
  toBankAdjustmentDto,
  toTransferDto,
} from "./money.mapper";

const MOVEMENT_LIMIT = 20;

export class MoneyService implements IMoneyService {
  constructor(
    private readonly repo: IMoneyRepository,
    private readonly logger: LoggerPort,
  ) {}

  async getCashSummary(companyId: string): Promise<CashSummaryDto> {
    const [balance, adjustments, transfers] = await Promise.all([
      this.repo.getCashBalance(companyId),
      this.repo.listCashAdjustments(companyId, MOVEMENT_LIMIT),
      this.repo.listCashTransfers(companyId, MOVEMENT_LIMIT),
    ]);

    return {
      balance,
      adjustments: adjustments.map(toAdjustmentDto),
      transfers: transfers.map(toTransferDto),
    };
  }

  async adjustCash(
    companyId: string,
    dto: AdjustCashDto,
  ): Promise<AdjustmentDto> {
    const record = await this.repo.createCashAdjustment(companyId, {
      date: new Date(dto.date),
      type: dto.type,
      amount: dto.amount,
      description: dto.description,
    });

    this.logCashAdjustment(companyId, dto.type, dto.amount, "created");

    return toAdjustmentDto(record);
  }

  async updateCashAdjustment(
    companyId: string,
    adjustmentId: string,
    dto: AdjustCashDto,
  ): Promise<AdjustmentDto> {
    const record = await this.repo.updateCashAdjustment(companyId, adjustmentId, {
      date: new Date(dto.date),
      type: dto.type,
      amount: dto.amount,
      description: dto.description,
    });
    if (!record) throw new NotFoundError("Cash adjustment");

    this.logCashAdjustment(companyId, dto.type, dto.amount, "updated");

    return toAdjustmentDto(record);
  }

  async deleteCashAdjustment(
    companyId: string,
    adjustmentId: string,
  ): Promise<void> {
    const deleted = await this.repo.deleteCashAdjustment(companyId, adjustmentId);
    if (!deleted) throw new NotFoundError("Cash adjustment");

    this.logger.info(
      {
        category: "audit",
        action: "cash.adjustment.deleted",
        companyId,
        adjustmentId,
      },
      "Cash adjustment deleted",
    );
  }

  async adjustBank(
    companyId: string,
    bankId: string,
    dto: AdjustBankDto,
  ): Promise<BankAdjustmentDto> {
    const bank = await this.repo.findBank(bankId, companyId);
    if (!bank) throw new NotFoundError("Bank");

    const record = await this.repo.createBankAdjustment(companyId, {
      bankId,
      date: new Date(dto.date),
      type: dto.type,
      amount: dto.amount,
      description: dto.description,
      image: dto.image,
    });

    this.logBankAdjustment(companyId, bankId, dto.type, dto.amount, "created");

    return toBankAdjustmentDto(record);
  }

  async updateBankAdjustment(
    companyId: string,
    bankId: string,
    adjustmentId: string,
    dto: AdjustBankDto,
  ): Promise<BankAdjustmentDto> {
    const bank = await this.repo.findBank(bankId, companyId);
    if (!bank) throw new NotFoundError("Bank");

    const record = await this.repo.updateBankAdjustment(
      companyId,
      bankId,
      adjustmentId,
      {
        date: new Date(dto.date),
        type: dto.type,
        amount: dto.amount,
        description: dto.description,
        image: dto.image,
      },
    );
    if (!record) throw new NotFoundError("Bank adjustment");

    this.logBankAdjustment(companyId, bankId, dto.type, dto.amount, "updated");

    return toBankAdjustmentDto(record);
  }

  async deleteBankAdjustment(
    companyId: string,
    bankId: string,
    adjustmentId: string,
  ): Promise<void> {
    const deleted = await this.repo.deleteBankAdjustment(
      companyId,
      bankId,
      adjustmentId,
    );
    if (!deleted) throw new NotFoundError("Bank adjustment");

    this.logger.info(
      {
        category: "audit",
        action: "bank.adjustment.deleted",
        companyId,
        bankId,
        adjustmentId,
      },
      "Bank adjustment deleted",
    );
  }

  async createTransfer(
    companyId: string,
    dto: CreateTransferDto,
  ): Promise<TransferDto> {
    const fromBankId = dto.from === CASH ? null : dto.from;
    const toBankId = dto.to === CASH ? null : dto.to;

    const bankIds = [fromBankId, toBankId].filter(
      (id): id is string => id !== null,
    );
    await this.assertBanksExist(companyId, bankIds);

    const record = await this.repo.createTransfer(companyId, {
      date: new Date(dto.date),
      amount: dto.amount,
      fromBankId,
      toBankId,
      description: dto.description,
      image: dto.image,
    });

    this.logTransfer(companyId, fromBankId, toBankId, dto.amount, "created");

    return toTransferDto(record);
  }

  async updateTransfer(
    companyId: string,
    transferId: string,
    dto: CreateTransferDto,
  ): Promise<TransferDto> {
    const fromBankId = dto.from === CASH ? null : dto.from;
    const toBankId = dto.to === CASH ? null : dto.to;

    const bankIds = [fromBankId, toBankId].filter(
      (id): id is string => id !== null,
    );
    await this.assertBanksExist(companyId, bankIds);

    const record = await this.repo.updateTransfer(companyId, transferId, {
      date: new Date(dto.date),
      amount: dto.amount,
      fromBankId,
      toBankId,
      description: dto.description,
      image: dto.image,
    });
    if (!record) throw new NotFoundError("Transfer");

    this.logTransfer(companyId, fromBankId, toBankId, dto.amount, "updated");

    return toTransferDto(record);
  }

  async deleteTransfer(companyId: string, transferId: string): Promise<void> {
    const deleted = await this.repo.deleteTransfer(companyId, transferId);
    if (!deleted) throw new NotFoundError("Transfer");

    this.logger.info(
      {
        category: "audit",
        action: "money.transfer.deleted",
        companyId,
        transferId,
      },
      "Money transfer deleted",
    );
  }

  async getBankHistory(companyId: string, bankId: string): Promise<BankHistoryDto> {
    const bank = await this.repo.findBank(bankId, companyId);
    if (!bank) throw new NotFoundError("Bank");

    const [balance, adjustments, transfers] = await Promise.all([
      this.repo.getBankBalance(bankId),
      this.repo.listBankAdjustments(companyId, bankId, MOVEMENT_LIMIT),
      this.repo.listBankTransfers(companyId, bankId, MOVEMENT_LIMIT),
    ]);

    return {
      balance,
      adjustments: adjustments.map(toBankAdjustmentDto),
      transfers: transfers.map(toTransferDto),
    };
  }

  private logCashAdjustment(
    companyId: string,
    type: string,
    amount: number,
    verb: string,
  ): void {
    this.logger.info(
      {
        category: "audit",
        action: `cash.adjustment.${verb}`,
        companyId,
        type,
        amount,
      },
      `Cash adjustment ${verb}`,
    );
  }

  private logBankAdjustment(
    companyId: string,
    bankId: string,
    type: string,
    amount: number,
    verb: string,
  ): void {
    this.logger.info(
      {
        category: "audit",
        action: `bank.adjustment.${verb}`,
        companyId,
        bankId,
        type,
        amount,
      },
      `Bank adjustment ${verb}`,
    );
  }

  private logTransfer(
    companyId: string,
    fromBankId: string | null,
    toBankId: string | null,
    amount: number,
    verb: string,
  ): void {
    this.logger.info(
      {
        category: "audit",
        action: `money.transfer.${verb}`,
        companyId,
        fromBankId,
        toBankId,
        amount,
      },
      `Money transfer ${verb}`,
    );
  }

  private async assertBanksExist(
    companyId: string,
    bankIds: string[],
  ): Promise<void> {
    for (const bankId of bankIds) {
      const bank = await this.repo.findBank(bankId, companyId);
      if (!bank) throw new NotFoundError("Bank");
    }
  }
}