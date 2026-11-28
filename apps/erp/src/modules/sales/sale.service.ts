import {
  BadGatewayError,
  BadRequestError,
  ConflictError,
  NotFoundError,
  type LoggerPort,
} from "backend-p";
import type {
  CreateSaleDto,
  SaleDto,
  SendSaleInvoiceDto,
  UpdateSaleDto,
} from "shared";
import type {
  IEmailProvider,
  SendEmailResult,
} from "../email/email-provider.port";

type SalePaymentInput = CreateSaleDto["payments"][number];
import type { ISaleRepository } from "./sale.repository.port";
import type { ISaleService, SaleListParams } from "./sale.service.port";
import type {
  PaymentCreateData,
  SaleCreateData,
  SaleEmailSenderConfig,
  SaleRecord,
  SaleUpdateData,
} from "./sale.types";
import { toSaleDto } from "./sale.mapper";

const PDF_DATA_URL_PREFIX = "data:application/pdf;base64,";
const BASE64_PATTERN = /^[A-Za-z0-9+/=\s]+$/;

export class SaleService implements ISaleService {
  constructor(
    private readonly repo: ISaleRepository,
    private readonly logger: LoggerPort,
    private readonly email: IEmailProvider,
    private readonly mailSender: SaleEmailSenderConfig,
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

  async sendInvoice(
    companyId: string,
    saleId: string,
    dto: SendSaleInvoiceDto,
  ): Promise<void> {
    const sale = await this.repo.findById(saleId, companyId);
    if (!sale) throw new NotFoundError("Sale");

    const companyEmail = await this.repo.getCompanyEmail(companyId);
    const senderAddress =
      this.mailSender.fromAddressOverride.trim() || (companyEmail ?? "").trim();
    if (!senderAddress) {
      throw new BadRequestError(
        "Company email is not configured — add one in company settings before sending invoices",
      );
    }

    const contentBase64 = dto.pdfBase64.slice(PDF_DATA_URL_PREFIX.length);
    if (!contentBase64 || !BASE64_PATTERN.test(contentBase64)) {
      throw new BadRequestError("Invoice PDF is not valid base64 content");
    }

    const from =
      this.mailSender.fromName.trim().length > 0
        ? `${this.mailSender.fromName.trim()} <${senderAddress}>`
        : senderAddress;
    const subject =
      dto.subject?.trim() || `Sale invoice ${sale.id.slice(0, 8)}`;
    const lines = [
      `Dear ${sale.partyName},`,
      "",
      "Please find your invoice attached.",
    ];
    if (dto.notes?.trim()) {
      lines.push("", dto.notes.trim());
    }
    const text = lines.join("\n");

    let result: SendEmailResult | null = null;
    try {
      result =
        (await this.email.send({
          from,
          to: dto.to,
          subject,
          text,
          attachments: [
            {
              filename: `invoice-${sale.id.slice(0, 8)}.pdf`,
              contentBase64,
              contentType: "application/pdf",
            },
          ],
        })) ?? null;
    } catch (error) {
      this.logger.error(
        {
          category: "audit",
          action: "sale.sendInvoice.failed",
          companyId,
          saleId,
          to: dto.to,
          providerError: error instanceof Error ? error.message : String(error),
        },
        "Failed to send sale invoice",
      );
      throw new BadGatewayError(
        "Email provider failed to send the invoice — try again later",
      );
    }

    this.logger.info(
      {
        category: "audit",
        action: "sale.sendInvoice",
        companyId,
        saleId,
        partyId: sale.partyId,
        to: dto.to,
        previewUrl: result?.previewUrl ?? null,
      },
      "Sale invoice sent",
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
    if (
      bankIds.length > 0 &&
      !(await this.repo.banksExist(companyId, bankIds))
    ) {
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
