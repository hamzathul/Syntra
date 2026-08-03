import {
  ConflictError,
  NotFoundError,
  isPrismaUniqueViolation,
} from "backend-p";
import type { LoggerPort } from "backend-p";
import type { CreateUnitDto, UnitDto, UpdateUnitDto } from "shared";
import type { IUnitRepository } from "./unit.repository.port";
import type { IUnitService } from "./unit.service.port";
import { toUnitDto } from "./unit.mapper";

export class UnitService implements IUnitService {
  constructor(
    private readonly repo: IUnitRepository,
    private readonly logger: LoggerPort,
  ) {}

  async list(companyId: string): Promise<UnitDto[]> {
    const records = await this.repo.findAll(companyId);
    return records.map(toUnitDto);
  }

  async create(companyId: string, dto: CreateUnitDto): Promise<UnitDto> {
    let record;
    try {
      record = await this.repo.create(companyId, {
        name: dto.name,
        shortName: dto.shortName,
      });
    } catch (error) {
      if (isPrismaUniqueViolation(error)) {
        throw new ConflictError("A unit with this name already exists");
      }
      throw error;
    }

    this.logger.info(
      {
        category: "audit",
        action: "unit.created",
        companyId,
        unitId: record.id,
      },
      "Unit created",
    );

    return toUnitDto(record);
  }

  async update(
    id: string,
    companyId: string,
    dto: UpdateUnitDto,
  ): Promise<UnitDto> {
    const existing = await this.repo.findById(id, companyId);
    if (!existing) throw new NotFoundError("Unit");

    let record;
    try {
      record = await this.repo.update(id, {
        name: dto.name,
        shortName: dto.shortName,
      });
    } catch (error) {
      if (isPrismaUniqueViolation(error)) {
        throw new ConflictError("A unit with this name already exists");
      }
      throw error;
    }

    this.logger.info(
      {
        category: "audit",
        action: "unit.updated",
        companyId,
        unitId: id,
      },
      "Unit updated",
    );

    return toUnitDto(record);
  }

  async remove(id: string, companyId: string): Promise<void> {
    const existing = await this.repo.findById(id, companyId);
    if (!existing) throw new NotFoundError("Unit");

    const used = await this.repo.isUsedInAnyItem(id, companyId);
    if (used) {
      throw new ConflictError("Cannot delete a unit that is used by an item");
    }

    await this.repo.delete(id);

    this.logger.info(
      {
        category: "audit",
        action: "unit.deleted",
        companyId,
        unitId: id,
      },
      "Unit deleted",
    );
  }

  async seedDefaults(companyId: string): Promise<void> {
    await this.repo.seedDefaults(companyId);
  }
}
