import {
  ConflictError,
  NotFoundError,
  isPrismaUniqueViolation,
} from "backend-p";
import type { LoggerPort } from "backend-p";
import type { TaxGroupDto, CreateTaxGroupDto, UpdateTaxGroupDto } from "shared";
import type { ITaxGroupRepository } from "./tax-group.repository.port";
import type { ITaxRateRepository } from "./tax-rate.repository.port";
import type { ITaxGroupService } from "./tax-group.service.port";
import { toTaxGroupDto } from "./tax-group.mapper";

export class TaxGroupService implements ITaxGroupService {
  constructor(
    private readonly repo: ITaxGroupRepository,
    private readonly taxRateRepo: ITaxRateRepository,
    private readonly logger: LoggerPort,
  ) {}

  async list(companyId: string): Promise<TaxGroupDto[]> {
    const records = await this.repo.findAll(companyId);
    return records.map(toTaxGroupDto);
  }

  async create(
    companyId: string,
    dto: CreateTaxGroupDto,
  ): Promise<TaxGroupDto> {
    await this.assertTaxRatesBelongToCompany(dto.taxRateIds, companyId);

    let record;
    try {
      record = await this.repo.create(companyId, {
        name: dto.name,
        taxRateIds: dto.taxRateIds,
      });
    } catch (error) {
      if (isPrismaUniqueViolation(error)) {
        throw new ConflictError("A tax group with this name already exists");
      }
      throw error;
    }

    this.logger.info(
      {
        category: "audit",
        action: "tax-group.created",
        companyId,
        taxGroupId: record.id,
      },
      "Tax group created",
    );

    return toTaxGroupDto(record);
  }

  async update(
    id: string,
    companyId: string,
    dto: UpdateTaxGroupDto,
  ): Promise<TaxGroupDto> {
    const existing = await this.repo.findById(id, companyId);
    if (!existing) throw new NotFoundError("Tax group");

    if (dto.taxRateIds) {
      await this.assertTaxRatesBelongToCompany(dto.taxRateIds, companyId);
    }

    let record;
    try {
      record = await this.repo.update(id, companyId, dto);
    } catch (error) {
      if (isPrismaUniqueViolation(error)) {
        throw new ConflictError("A tax group with this name already exists");
      }
      throw error;
    }

    this.logger.info(
      {
        category: "audit",
        action: "tax-group.updated",
        companyId,
        taxGroupId: id,
      },
      "Tax group updated",
    );

    return toTaxGroupDto(record);
  }

  async remove(id: string, companyId: string): Promise<void> {
    const existing = await this.repo.findById(id, companyId);
    if (!existing) throw new NotFoundError("Tax group");

    await this.repo.delete(id);

    this.logger.info(
      {
        category: "audit",
        action: "tax-group.deleted",
        companyId,
        taxGroupId: id,
      },
      "Tax group deleted",
    );
  }

  private async assertTaxRatesBelongToCompany(
    taxRateIds: string[],
    companyId: string,
  ): Promise<void> {
    const uniqueIds = [...new Set(taxRateIds)];
    const count = await this.taxRateRepo.countByIds(uniqueIds, companyId);
    if (count !== uniqueIds.length) {
      throw new ConflictError(
        "One or more tax rates do not exist or do not belong to this company",
      );
    }
  }
}
