import { NotFoundError } from "backend-p";
import type { LoggerPort } from "backend-p";
import type { TaxGroupDto, CreateTaxGroupDto, UpdateTaxGroupDto } from "shared";
import type { ITaxGroupRepository } from "./tax-group.repository.port";
import type { ITaxGroupService } from "./tax-group.service.port";
import type { TaxGroupRecord } from "./taxes.types";

export class TaxGroupService implements ITaxGroupService {
  constructor(
    private readonly repo: ITaxGroupRepository,
    private readonly logger: LoggerPort,
  ) {}

  async list(companyId: string): Promise<TaxGroupDto[]> {
    const records = await this.repo.findAll(companyId);
    return records.map((r) => this.toDto(r));
  }

  async create(companyId: string, dto: CreateTaxGroupDto): Promise<TaxGroupDto> {
    const record = await this.repo.create(companyId, { name: dto.name, taxRateIds: dto.taxRateIds });

    this.logger.info(
      { category: "audit", action: "tax-group.created", companyId, taxGroupId: record.id },
      "Tax group created",
    );

    return this.toDto(record);
  }

  async update(id: string, companyId: string, dto: UpdateTaxGroupDto): Promise<TaxGroupDto> {
    const existing = await this.repo.findById(id, companyId);
    if (!existing) throw new NotFoundError("Tax group");

    const record = await this.repo.update(id, companyId, dto as { name?: string; taxRateIds?: string[] });

    this.logger.info(
      { category: "audit", action: "tax-group.updated", companyId, taxGroupId: id },
      "Tax group updated",
    );

    return this.toDto(record);
  }

  async remove(id: string, companyId: string): Promise<void> {
    const existing = await this.repo.findById(id, companyId);
    if (!existing) throw new NotFoundError("Tax group");

    await this.repo.delete(id);

    this.logger.info(
      { category: "audit", action: "tax-group.deleted", companyId, taxGroupId: id },
      "Tax group deleted",
    );
  }

  private toDto(record: TaxGroupRecord): TaxGroupDto {
    const rates = record.groupRates.map((gr) => ({
      id: gr.taxRate.id,
      companyId: gr.taxRate.companyId,
      name: gr.taxRate.name,
      rate: gr.taxRate.rate,
      createdAt: gr.taxRate.createdAt.toISOString(),
      updatedAt: gr.taxRate.updatedAt.toISOString(),
    }));

    return {
      id: record.id,
      companyId: record.companyId,
      name: record.name,
      rates,
      totalRate: rates.reduce((sum, r) => sum + r.rate, 0),
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString(),
    };
  }
}
