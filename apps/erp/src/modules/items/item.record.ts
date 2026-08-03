import type { DiscountType, ItemType } from "shared";
import type { ItemRecord } from "./items.types";
import { toUnitRecord, type UnitRow } from "./unit.record";
import {
  toItemCategoryRecord,
  type ItemCategoryRow,
} from "./item-category.record";
import { toTaxRateRecord, type TaxRateRow } from "../settings/taxes/tax-rate.record";

export interface TaxGroupRow {
  readonly id: string;
  readonly companyId: string;
  readonly name: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly groupRates: Array<{
    readonly taxRate: TaxRateRow;
  }>;
}

function toTaxGroupRecord(row: TaxGroupRow): ItemRecord["taxGroup"] {
  return {
    id: row.id,
    companyId: row.companyId,
    name: row.name,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    groupRates: row.groupRates.map((gr) => ({
      taxRate: toTaxRateRecord(gr.taxRate),
    })),
  };
}

export interface ItemRow {
  readonly id: string;
  readonly companyId: string;
  readonly name: string;
  readonly itemType: ItemType;
  readonly itemCode: string | null;
  readonly barcode: string | null;
  readonly categoryId: string | null;
  readonly hsnSac: string | null;
  readonly description: string | null;
  readonly image: string | null;
  readonly unitPrimaryId: string;
  readonly unitSecondaryId: string | null;
  readonly unitConversionRate: number | null;
  readonly salePriceExclTax: number | null;
  readonly salePriceInclTax: number | null;
  readonly saleDiscountType: DiscountType | null;
  readonly saleDiscountValue: number | null;
  readonly purchasePriceExclTax: number | null;
  readonly purchasePriceInclTax: number | null;
  readonly taxRateId: string | null;
  readonly taxGroupId: string | null;
  readonly openingStock: number | null;
  readonly openingStockDate: Date | null;
  readonly openingStockValuePerUnit: number | null;
  readonly minStockQuantity: number | null;
  readonly location: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly category: ItemCategoryRow | null;
  readonly unitPrimary: UnitRow;
  readonly unitSecondary: UnitRow | null;
  readonly taxRate: TaxRateRow | null;
  readonly taxGroup: TaxGroupRow | null;
}

export function toItemRecord(row: ItemRow): ItemRecord {
  return {
    id: row.id,
    companyId: row.companyId,
    name: row.name,
    itemType: row.itemType,
    itemCode: row.itemCode,
    barcode: row.barcode,
    categoryId: row.categoryId,
    hsnSac: row.hsnSac,
    description: row.description,
    image: row.image,
    unitPrimaryId: row.unitPrimaryId,
    unitSecondaryId: row.unitSecondaryId,
    unitConversionRate: toNumber(row.unitConversionRate),
    salePriceExclTax: toNumber(row.salePriceExclTax),
    salePriceInclTax: toNumber(row.salePriceInclTax),
    saleDiscountType: row.saleDiscountType,
    saleDiscountValue: toNumber(row.saleDiscountValue),
    purchasePriceExclTax: toNumber(row.purchasePriceExclTax),
    purchasePriceInclTax: toNumber(row.purchasePriceInclTax),
    taxRateId: row.taxRateId,
    taxGroupId: row.taxGroupId,
    openingStock: toNumber(row.openingStock),
    openingStockDate: row.openingStockDate,
    openingStockValuePerUnit: toNumber(row.openingStockValuePerUnit),
    minStockQuantity: toNumber(row.minStockQuantity),
    location: row.location,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    category: row.category ? toItemCategoryRecord(row.category) : null,
    unitPrimary: toUnitRecord(row.unitPrimary),
    unitSecondary: row.unitSecondary ? toUnitRecord(row.unitSecondary) : null,
    taxRate: row.taxRate ? toTaxRateRecord(row.taxRate) : null,
    taxGroup: row.taxGroup ? toTaxGroupRecord(row.taxGroup) : null,
  };
}

function toNumber(value: number | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  return Number(value);
}
