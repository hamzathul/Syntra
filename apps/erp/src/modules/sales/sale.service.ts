import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  type LoggerPort,
} from "backend-p";
import type { CreateSaleDto, SaleDto, UpdateSaleDto } from "shared";

type SalePaymentInput = CreateSaleDto["payments"][number];
import type { ISaleRepository } from "./sale.repository.port";
import type { ISaleService, SaleListParams } from "./sale.service.port";
import type {
  PaymentCreateData,
  SaleCreateData,
  SaleRecord,
  SaleUpdateData,
} from "./sale.types";
import { toSaleDto } from "./sale.mapper";

export class SaleService implements ISaleService {
  constructor(
    private readonly repo: ISaleRepository,
    private readonly logger: LoggerPort,
  ) {}

  async list(companyId: string, params?: SaleListParams) {
    const result = await this.repo.findAll(companyId, params);
    return {
      items: result.items.map(toSaleDto),
      meta: result.meta,
    };
  }

  async get(id: string, companyId: string): Promise<SaleDto> {
    const record = await this.repo.findById(id, companyId);
    if (!record) throw new NotFoundError("Sale");
    return toSaleDto(record);
  }

  async create(companyId: string, dto: CreateSaleDto): Promise<SaleDto> {
    const data = this.toCreateData(dto);
    await this.assertReferences(companyId, data);

    const record = await this.repo.create(companyId, data);

    this.logger.info(
      {
        category: "audit",
        action: "sale.created",
        companyId,
        saleId: record.id,
        partyId: record.partyId,
        saleType: record.saleType,
      },
      "Sale created",
    );

    return toSaleDto(record);
  }

  async update(
    id: string,
    companyId: string,
    dto: UpdateSaleDto,
  ): Promise<SaleDto> {
    const existing = await this.repo.findById(id, companyId);
    if (!existing) throw new NotFoundError("Sale");

    const hasLockedCheque = existing.payments.some(
      (payment) => payment.cheque && payment.cheque.status !== "RECEIVED",
    );
    if (hasLockedCheque && this.moneyFieldsChanged(dto, existing)) {
      throw new ConflictError(
        "Amounts and payments cannot be changed because a cheque on this sale has already been deposited or bounced",
      );
    }

    const data = this.toUpdateData(dto, existing);
    await this.assertReferences(companyId, data, existing);

    const record = await this.repo.update(id, companyId, data);

    this.logger.info(
      {
        category: "audit",
        action: "sale.updated",
        companyId,
        saleId: id,
        partyId: record.partyId,
        saleType: record.saleType,
      },
      "Sale updated",
    );

    return toSaleDto(record);
  }

  async remove(id: string, companyId: string): Promise<void> {
    const existing = await this.repo.findById(id, companyId);
    if (!existing) throw new NotFoundError("Sale");

    await this.repo.delete(id, companyId);

    this.logger.info(
      {
        category: "audit",
        action: "sale.deleted",
        companyId,
        saleId: id,
        partyId: existing.partyId,
        saleType: existing.saleType,
      },
      "Sale deleted",
    );
  }

  private async assertReferences(
    companyId: string,
    data: SaleCreateData | SaleUpdateData,
    existing?: SaleRecord,
  ): Promise<void> {
    const partyId = data.partyId ?? existing?.partyId;
    if (partyId && !(await this.repo.partyExists(companyId, partyId))) {
      throw new BadRequestError("Selected customer does not exist");
    }

    const bankIds = (data.payments ?? existing?.payments ?? [])
      .filter((payment) => payment.mode === "BANK" && payment.bankId)
      .map((payment) => payment.bankId as string);
    if (bankIds.length > 0 && !(await this.repo.banksExist(companyId, bankIds))) {
      throw new BadRequestError("Selected bank does not exist");
    }
  }

  private toCreateData(dto: CreateSaleDto): SaleCreateData {
    const receivedAmount =
      dto.saleType === "CASH" ? dto.totalAmount : (dto.receivedAmount ?? 0);
    this.assertPaymentsTotal(dto.payments, receivedAmount);

    return {
      partyId: dto.partyId,
      saleType: dto.saleType,
      saleDate: dto.saleDate ? new Date(dto.saleDate) : new Date(),
      totalAmount: dto.totalAmount,
      receivedAmount,
      description: dto.description,
      image: dto.image,
      document: dto.document,
      payments: dto.payments.map((payment) =>
        this.toPaymentCreateData(payment),
      ),
    };
  }

  private toUpdateData(
    dto: UpdateSaleDto,
    existing: SaleRecord,
  ): SaleUpdateData {
    const data: Record<string, unknown> = {};

    if (dto.receivedAmount !== undefined && dto.payments === undefined) {
      throw new BadRequestError(
        "receivedAmount must be submitted together with payments",
      );
    }
    if (
      existing.saleType === "CASH" &&
      dto.totalAmount !== undefined &&
      dto.totalAmount !== existing.totalAmount &&
      dto.payments === undefined
    ) {
      throw new BadRequestError(
        "Changing a cash sale amount requires its payment entries",
      );
    }

    if (dto.partyId !== undefined) data.partyId = dto.partyId;
    if (dto.saleDate !== undefined) data.saleDate = new Date(dto.saleDate);
    if (dto.totalAmount !== undefined) data.totalAmount = dto.totalAmount;
    if (dto.receivedAmount !== undefined) {
      data.receivedAmount = dto.receivedAmount;
    }
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.image !== undefined) data.image = dto.image;
    if (dto.document !== undefined) data.document = dto.document;

    const effectiveTotal = dto.totalAmount ?? existing.totalAmount;
    const effectiveReceived =
      existing.saleType === "CASH"
        ? effectiveTotal
        : (dto.receivedAmount ?? existing.receivedAmount);
    if (effectiveReceived > effectiveTotal) {
      throw new BadRequestError(
        "Received amount cannot exceed the total amount",
      );
    }

    if (dto.payments !== undefined) {
      this.assertPaymentsTotal(dto.payments, effectiveReceived);
      data.receivedAmount = effectiveReceived;
      data.payments = dto.payments.map((payment) =>
        this.toPaymentCreateData(payment),
      );
    }

    return data as SaleUpdateData;
  }

  private toPaymentCreateData(payment: SalePaymentInput): PaymentCreateData {
    return {
      mode: payment.mode,
      amount: payment.amount,
      bankId: payment.bankId,
      description: payment.description,
      cheque: payment.cheque
        ? {
            drawBankName: payment.cheque.drawBankName,
            chequeNumber: payment.cheque.chequeNumber,
            chequeDate: new Date(payment.cheque.chequeDate),
            notes: payment.cheque.notes,
            image: payment.cheque.image,
          }
        : null,
    };
  }

  private assertPaymentsTotal(
    payments: SalePaymentInput[],
    receivedAmount: number,
  ): void {
    const sum = payments.reduce((acc, payment) => acc + payment.amount, 0);
    if (Math.abs(sum - receivedAmount) > 0.00001) {
      throw new BadRequestError(
        "Payments must total exactly the received amount for this sale",
      );
    }
  }

  private moneyFieldsChanged(
    dto: UpdateSaleDto,
    existing: SaleRecord,
  ): boolean {
    if (
      dto.totalAmount !== undefined &&
      dto.totalAmount !== existing.totalAmount
    ) {
      return true;
    }
    if (
      dto.receivedAmount !== undefined &&
      dto.receivedAmount !== existing.receivedAmount
    ) {
      return true;
    }
    if (dto.payments === undefined) return false;

    const current = existing.payments.map((payment) => ({
      mode: payment.mode,
      amount: payment.amount,
      bankId: payment.bankId,
      cheque: payment.cheque
        ? {
            drawBankName: payment.cheque.drawBankName,
            chequeNumber: payment.cheque.chequeNumber,
            chequeDate: payment.cheque.chequeDate.toISOString().slice(0, 10),
          }
        : null,
    }));
    const incoming = dto.payments.map((payment) => ({
      mode: payment.mode,
      amount: payment.amount,
      bankId: payment.bankId ?? null,
      cheque: payment.cheque
        ? {
            drawBankName: payment.cheque.drawBankName,
            chequeNumber: payment.cheque.chequeNumber,
            chequeDate:
              typeof payment.cheque.chequeDate === "string"
                ? payment.cheque.chequeDate.slice(0, 10)
                : payment.cheque.chequeDate,
          }
        : null,
    }));
    return JSON.stringify(current) !== JSON.stringify(incoming);
  }
}
