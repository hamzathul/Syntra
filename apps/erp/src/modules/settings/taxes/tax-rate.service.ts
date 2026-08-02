import { ConflictError, NotFoundError } from "backend-p";
import type { LoggerPort } from "backend-p";
import type { TaxRateDto, CreateTaxRateDto, UpdateTaxRateDto } from "shared";
import type { ITaxRateRepository } from "./tax-rate.repository.port";
import type { ITaxRateService } from "./tax-rate.service.port";
import { toTaxRateDto } from "./tax-rate.mapper";

export class TaxRateService implements ITaxRateService {
  constructor(
    private readonly repo: ITaxRateRepository,
    private readonly logger: LoggerPort,
  ) {}

  async list(companyId: string): Promise<TaxRateDto[]> {
    const records = await this.repo.findAll(companyId);
    return records.map(toTaxRateDto);
  }

  async create(companyId: string, dto: CreateTaxRateDto): Promise<TaxRateDto> {
    const record = await this.repo.create(companyId, {
      name: dto.name,
      rate: dto.rate,
    });

    this.logger.info(
      {
        category: "audit",
        action: "tax-rate.created",
        companyId,
        taxRateId: record.id,
      },
      "Tax rate created",
    );

    return toTaxRateDto(record);
  }

  async update(
    id: string,
    companyId: string,
    dto: UpdateTaxRateDto,
  ): Promise<TaxRateDto> {
    const existing = await this.repo.findById(id, companyId);
    if (!existing) throw new NotFoundError("Tax rate");

    const record = await this.repo.update(id, dto);

    this.logger.info(
      {
        category: "audit",
        action: "tax-rate.updated",
        companyId,
        taxRateId: id,
      },
      "Tax rate updated",
    );

    return toTaxRateDto(record);
  }

  async remove(id: string, companyId: string): Promise<void> {
    const existing = await this.repo.findById(id, companyId);
    if (!existing) throw new NotFoundError("Tax rate");

    const used = await this.repo.isUsedInAnyGroup(id, companyId);
    if (used)
      throw new ConflictError(
        "Cannot delete tax rate that is used in a tax group",
      );

    await this.repo.delete(id);

    this.logger.info(
      {
        category: "audit",
        action: "tax-rate.deleted",
        companyId,
        taxRateId: id,
      },
      "Tax rate deleted",
    );
  }
}
