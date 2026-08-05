import {
  ConflictError,
  NotFoundError,
  isPrismaUniqueViolation,
} from "backend-p";
import type { LoggerPort } from "backend-p";
import type {
  CreateItemCategoryDto,
  ItemCategoryDto,
  UpdateItemCategoryDto,
} from "shared";
import type { IItemCategoryRepository } from "./item-category.repository.port";
import type { IItemCategoryService } from "./item-category.service.port";
import { toItemCategoryDto } from "./item-category.mapper";

export class ItemCategoryService implements IItemCategoryService {
  constructor(
    private readonly repo: IItemCategoryRepository,
    private readonly logger: LoggerPort,
  ) {}

  async list(companyId: string): Promise<ItemCategoryDto[]> {
    const records = await this.repo.findAll(companyId);
    return records.map(toItemCategoryDto);
  }

  async create(
    companyId: string,
    dto: CreateItemCategoryDto,
  ): Promise<ItemCategoryDto> {
    let record;
    try {
      record = await this.repo.create(companyId, { name: dto.name });
    } catch (error) {
      if (isPrismaUniqueViolation(error)) {
        throw new ConflictError("A category with this name already exists");
      }
      throw error;
    }

    this.logger.info(
      {
        category: "audit",
        action: "item-category.created",
        companyId,
        categoryId: record.id,
      },
      "Item category created",
    );

    return toItemCategoryDto(record);
  }

  async update(
    id: string,
    companyId: string,
    dto: UpdateItemCategoryDto,
  ): Promise<ItemCategoryDto> {
    const existing = await this.repo.findById(id, companyId);
    if (!existing) throw new NotFoundError("Item category");

    let record;
    try {
      record = await this.repo.update(id, companyId, { name: dto.name });
    } catch (error) {
      if (isPrismaUniqueViolation(error)) {
        throw new ConflictError("A category with this name already exists");
      }
      throw error;
    }

    this.logger.info(
      {
        category: "audit",
        action: "item-category.updated",
        companyId,
        categoryId: id,
      },
      "Item category updated",
    );

    return toItemCategoryDto(record);
  }

  async remove(id: string, companyId: string): Promise<void> {
    const existing = await this.repo.findById(id, companyId);
    if (!existing) throw new NotFoundError("Item category");

    const used = await this.repo.isUsedInAnyItem(id, companyId);
    if (used) {
      throw new ConflictError(
        "Cannot delete a category that is used by an item",
      );
    }

    await this.repo.delete(id, companyId);

    this.logger.info(
      {
        category: "audit",
        action: "item-category.deleted",
        companyId,
        categoryId: id,
      },
      "Item category deleted",
    );
  }
}
