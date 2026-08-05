import {
  ConflictError,
  InternalServerError,
  NotFoundError,
  isPrismaUniqueViolation,
} from "backend-p";
import type { LoggerPort } from "backend-p";
import type { CreateItemDto, ItemDto, UpdateItemDto } from "shared";
import type { IItemRepository } from "./item.repository.port";
import type { IItemCategoryRepository } from "./item-category.repository.port";
import type { IUnitRepository } from "./unit.repository.port";
import type { ITaxRateRepository } from "../settings/taxes/tax-rate.repository.port";
import type { ITaxGroupRepository } from "../settings/taxes/tax-group.repository.port";
import type { IItemService, ItemListParams } from "./item.service.port";
import type { ItemCreateData, ItemUpdateData } from "./items.types";
import { toItemDto } from "./item.mapper";
import { generateEan13, randomSegment } from "./code-generator";

const UPDATE_FIELDS = [
  "name",
  "itemCode",
  "barcode",
  "categoryId",
  "hsnSac",
  "description",
  "image",
  "unitPrimaryId",
  "unitSecondaryId",
  "unitConversionRate",
  "salePriceExclTax",
  "salePriceInclTax",
  "saleDiscountType",
  "saleDiscountValue",
  "purchasePriceExclTax",
  "purchasePriceInclTax",
  "taxRateId",
  "taxGroupId",
  "openingStock",
  "openingStockValuePerUnit",
  "minStockQuantity",
  "location",
] as const;

export class ItemService implements IItemService {
  constructor(
    private readonly repo: IItemRepository,
    private readonly categoryRepo: IItemCategoryRepository,
    private readonly unitRepo: IUnitRepository,
    private readonly taxRateRepo: ITaxRateRepository,
    private readonly taxGroupRepo: ITaxGroupRepository,
    private readonly logger: LoggerPort,
  ) {}

  async list(companyId: string, params?: ItemListParams) {
    const result = await this.repo.findAll(companyId, params);
    return {
      items: result.items.map(toItemDto),
      meta: result.meta,
    };
  }

  async get(id: string, companyId: string): Promise<ItemDto> {
    const record = await this.repo.findById(id, companyId);
    if (!record) throw new NotFoundError("Item");
    return toItemDto(record);
  }

  async create(companyId: string, dto: CreateItemDto): Promise<ItemDto> {
    await this.assertReferencesBelongToCompany(dto, companyId);

    let record;
    try {
      record = await this.repo.create(companyId, this.toCreateData(dto));
    } catch (error) {
      if (isPrismaUniqueViolation(error)) {
        throw await this.uniqueConflict(companyId, dto.itemCode, dto.barcode);
      }
      throw error;
    }

    this.logger.info(
      {
        category: "audit",
        action: "item.created",
        companyId,
        itemId: record.id,
      },
      "Item created",
    );

    return toItemDto(record);
  }

  async update(
    id: string,
    companyId: string,
    dto: UpdateItemDto,
  ): Promise<ItemDto> {
    const existing = await this.repo.findById(id, companyId);
    if (!existing) throw new NotFoundError("Item");

    await this.assertReferencesBelongToCompany(dto, companyId);

    let record;
    try {
      record = await this.repo.update(id, companyId, this.toUpdateData(dto));
    } catch (error) {
      if (isPrismaUniqueViolation(error)) {
        throw await this.uniqueConflict(companyId, dto.itemCode, dto.barcode, id);
      }
      throw error;
    }

    this.logger.info(
      {
        category: "audit",
        action: "item.updated",
        companyId,
        itemId: id,
      },
      "Item updated",
    );

    return toItemDto(record);
  }

  async remove(id: string, companyId: string): Promise<void> {
    const existing = await this.repo.findById(id, companyId);
    if (!existing) throw new NotFoundError("Item");

    await this.repo.delete(id, companyId);

    this.logger.info(
      {
        category: "audit",
        action: "item.deleted",
        companyId,
        itemId: id,
      },
      "Item deleted",
    );
  }

  async generateCode(companyId: string): Promise<{ code: string }> {
    for (let attempt = 0; attempt < 10; attempt += 1) {
      const code = `ITM-${randomSegment(6)}`;
      if (!(await this.repo.existsCode(code, companyId))) {
        return { code };
      }
    }
    throw new InternalServerError("Could not generate a unique item code");
  }

  async generateBarcode(companyId: string): Promise<{ barcode: string }> {
    for (let attempt = 0; attempt < 10; attempt += 1) {
      const barcode = generateEan13();
      if (!(await this.repo.existsBarcode(barcode, companyId))) {
        return { barcode };
      }
    }
    throw new InternalServerError("Could not generate a unique barcode");
  }

  private toCreateData(dto: CreateItemDto): ItemCreateData {
    return {
      name: dto.name,
      itemType: dto.itemType ?? "GOODS",
      itemCode: dto.itemCode,
      barcode: dto.barcode,
      categoryId: dto.categoryId,
      hsnSac: dto.hsnSac,
      description: dto.description,
      image: dto.image,
      unitPrimaryId: dto.unitPrimaryId,
      unitSecondaryId: dto.unitSecondaryId,
      unitConversionRate: dto.unitConversionRate,
      salePriceExclTax: dto.salePriceExclTax,
      salePriceInclTax: dto.salePriceInclTax,
      saleDiscountType: dto.saleDiscountType,
      saleDiscountValue: dto.saleDiscountValue,
      purchasePriceExclTax: dto.purchasePriceExclTax,
      purchasePriceInclTax: dto.purchasePriceInclTax,
      taxRateId: dto.taxRateId,
      taxGroupId: dto.taxGroupId,
      openingStock: dto.openingStock,
      openingStockDate: dto.openingStockDate
        ? new Date(dto.openingStockDate)
        : null,
      openingStockValuePerUnit: dto.openingStockValuePerUnit,
      minStockQuantity: dto.minStockQuantity,
      location: dto.location,
    };
  }

  private toUpdateData(dto: UpdateItemDto): ItemUpdateData {
    const data: Record<string, unknown> = {};
    for (const field of UPDATE_FIELDS) {
      if (dto[field] !== undefined) {
        data[field] = dto[field];
      }
    }
    if (dto.itemType !== undefined) {
      data.itemType = dto.itemType;
    }
    if (dto.openingStockDate !== undefined) {
      data.openingStockDate = dto.openingStockDate
        ? new Date(dto.openingStockDate)
        : null;
    }
    return data as ItemUpdateData;
  }

  private async assertReferencesBelongToCompany(
    dto: CreateItemDto | UpdateItemDto,
    companyId: string,
  ): Promise<void> {
    if (dto.categoryId) {
      const count = await this.categoryRepo.countByIds([dto.categoryId], companyId);
      if (count !== 1) {
        throw new ConflictError(
          "Selected category does not exist or does not belong to this company",
        );
      }
    }

    const unitIds = [dto.unitPrimaryId, dto.unitSecondaryId].filter(
      (id): id is string => typeof id === "string" && id.length > 0,
    );
    if (unitIds.length > 0) {
      const uniqueIds = [...new Set(unitIds)];
      const count = await this.unitRepo.countByIds(uniqueIds, companyId);
      if (count !== uniqueIds.length) {
        throw new ConflictError(
          "Selected unit does not exist or does not belong to this company",
        );
      }
    }

    if (dto.taxRateId) {
      const count = await this.taxRateRepo.countByIds([dto.taxRateId], companyId);
      if (count !== 1) {
        throw new ConflictError(
          "Selected tax rate does not exist or does not belong to this company",
        );
      }
    }

    if (dto.taxGroupId) {
      const group = await this.taxGroupRepo.findById(dto.taxGroupId, companyId);
      if (!group) {
        throw new ConflictError(
          "Selected tax group does not exist or does not belong to this company",
        );
      }
    }
  }

  private async uniqueConflict(
    companyId: string,
    itemCode: string | null | undefined,
    barcode: string | null | undefined,
    excludeId?: string,
  ): Promise<ConflictError> {
    if (barcode && (await this.repo.existsBarcode(barcode, companyId, excludeId))) {
      return new ConflictError("An item with this barcode already exists");
    }
    if (itemCode && (await this.repo.existsCode(itemCode, companyId, excludeId))) {
      return new ConflictError("An item with this code already exists");
    }
    return new ConflictError("An item with this name already exists");
  }
}
