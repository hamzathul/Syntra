import type { DiscountType, ItemType } from "shared";
import type { TaxGroupRecord, TaxRateRecord } from "../settings/taxes/taxes.types";

export interface UnitRecord {
  readonly id: string;
  readonly companyId: string;
  readonly name: string;
  readonly shortName: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface ItemCategoryRecord {
  readonly id: string;
  readonly companyId: string;
  readonly name: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface ItemRecord {
  readonly id: string;
  readonly companyId: string;
  readonly name: string;
  readonly itemType: ItemType;
  readonly itemCode: string | null;
  readonly barcode: string | null;
  readonly categoryId: string | null;
  readonly hsnSac: string | null;
  readonly description: string | null;
  readonly image?: string | null;
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
  readonly category: ItemCategoryRecord | null;
  readonly unitPrimary: UnitRecord;
  readonly unitSecondary: UnitRecord | null;
  readonly taxRate: TaxRateRecord | null;
  readonly taxGroup: TaxGroupRecord | null;
}

export interface ItemCreateData {
  readonly name: string;
  readonly itemType: ItemType;
  readonly itemCode?: string | null;
  readonly barcode?: string | null;
  readonly categoryId?: string | null;
  readonly hsnSac?: string | null;
  readonly description?: string | null;
  readonly image?: string | null;
  readonly unitPrimaryId: string;
  readonly unitSecondaryId?: string | null;
  readonly unitConversionRate?: number | null;
  readonly salePriceExclTax?: number | null;
  readonly salePriceInclTax?: number | null;
  readonly saleDiscountType?: DiscountType | null;
  readonly saleDiscountValue?: number | null;
  readonly purchasePriceExclTax?: number | null;
  readonly purchasePriceInclTax?: number | null;
  readonly taxRateId?: string | null;
  readonly taxGroupId?: string | null;
  readonly openingStock?: number | null;
  readonly openingStockDate?: Date | null;
  readonly openingStockValuePerUnit?: number | null;
  readonly minStockQuantity?: number | null;
  readonly location?: string | null;
}

export type ItemUpdateData = Partial<Omit<ItemCreateData, "companyId">>;

export interface UnitCreateData {
  readonly name: string;
  readonly shortName?: string | null;
}

export type UnitUpdateData = Partial<UnitCreateData>;

export interface ItemCategoryCreateData {
  readonly name: string;
}

export type ItemCategoryUpdateData = Partial<ItemCategoryCreateData>;
