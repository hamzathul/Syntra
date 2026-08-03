import type { ItemDto } from "shared";
import type { ItemRecord } from "./items.types";
import { toUnitDto } from "./unit.mapper";
import { toItemCategoryDto } from "./item-category.mapper";
import { toTaxRateDto } from "../settings/taxes/tax-rate.mapper";
import { toTaxGroupDto } from "../settings/taxes/tax-group.mapper";

export function toItemDto(record: ItemRecord): ItemDto {
  return {
    id: record.id,
    companyId: record.companyId,
    name: record.name,
    itemType: record.itemType,
    itemCode: record.itemCode,
    barcode: record.barcode,
    categoryId: record.categoryId,
    category: record.category ? toItemCategoryDto(record.category) : null,
    hsnSac: record.hsnSac,
    description: record.description,
    image: record.image,
    unitPrimaryId: record.unitPrimaryId,
    unitSecondaryId: record.unitSecondaryId,
    unitPrimary: toUnitDto(record.unitPrimary),
    unitSecondary: record.unitSecondary ? toUnitDto(record.unitSecondary) : null,
    unitConversionRate: record.unitConversionRate,
    salePriceExclTax: record.salePriceExclTax,
    salePriceInclTax: record.salePriceInclTax,
    saleDiscountType: record.saleDiscountType,
    saleDiscountValue: record.saleDiscountValue,
    purchasePriceExclTax: record.purchasePriceExclTax,
    purchasePriceInclTax: record.purchasePriceInclTax,
    taxRateId: record.taxRateId,
    taxGroupId: record.taxGroupId,
    taxRate: record.taxRate ? toTaxRateDto(record.taxRate) : null,
    taxGroup: record.taxGroup ? toTaxGroupDto(record.taxGroup) : null,
    openingStock: record.openingStock,
    openingStockDate: record.openingStockDate
      ? record.openingStockDate.toISOString()
      : null,
    openingStockValuePerUnit: record.openingStockValuePerUnit,
    minStockQuantity: record.minStockQuantity,
    location: record.location,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}
