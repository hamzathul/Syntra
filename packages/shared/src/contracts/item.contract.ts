import { z } from "zod";
import { taxRateResponseSchema, taxGroupResponseSchema } from "./tax-settings.contract";

export const itemTypes = ["GOODS", "SERVICE"] as const;
export type ItemType = (typeof itemTypes)[number];

export const discountTypes = ["AMOUNT", "PERCENTAGE"] as const;
export type DiscountType = (typeof discountTypes)[number];

const trimmedString = z.string().trim();

// ── Units ──────────────────────────────────────────────────────

export const createUnitSchema = z.object({
  name: trimmedString.min(1, "Unit name is required").max(50),
  shortName: trimmedString.max(10).optional(),
});

export const updateUnitSchema = z.object({
  name: trimmedString.min(1).max(50).optional(),
  shortName: trimmedString.max(10).nullable().optional(),
});

export const unitResponseSchema = z.object({
  id: z.string(),
  companyId: z.string(),
  name: z.string(),
  shortName: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type UnitDto = z.infer<typeof unitResponseSchema>;
export type CreateUnitDto = z.infer<typeof createUnitSchema>;
export type UpdateUnitDto = z.infer<typeof updateUnitSchema>;

// ── Item Categories ───────────────────────────────────────────

export const createItemCategorySchema = z.object({
  name: trimmedString.min(1, "Category name is required").max(100),
});

export const updateItemCategorySchema = z.object({
  name: trimmedString.min(1).max(100).optional(),
});

export const itemCategoryResponseSchema = z.object({
  id: z.string(),
  companyId: z.string(),
  name: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type ItemCategoryDto = z.infer<typeof itemCategoryResponseSchema>;
export type CreateItemCategoryDto = z.infer<typeof createItemCategorySchema>;
export type UpdateItemCategoryDto = z.infer<typeof updateItemCategorySchema>;

// ── Items ─────────────────────────────────────────────────────

const amount = (label: string) =>
  z
    .number()
    .nonnegative(`${label} must be non-negative`)
    .max(999_999_999_999, `${label} is too large`)
    .multipleOf(0.0001, `${label} must have at most 4 decimal places`);

const positiveAmount = (label: string) =>
  z
    .number()
    .positive(`${label} must be greater than zero`)
    .max(999_999_999_999, `${label} is too large`)
    .multipleOf(0.0001, `${label} must have at most 4 decimal places`);

const itemFieldShapes = {
  name: trimmedString.min(1, "Item name is required").max(200),
  itemType: z.enum(itemTypes).optional(),
  itemCode: trimmedString.max(50).optional(),
  barcode: trimmedString.max(100).optional(),
  categoryId: z.string().min(1).optional(),
  hsnSac: trimmedString.max(50).optional(),
  description: trimmedString.max(5000).optional(),
  image: z.string().max(800_000, "Image too large").optional(),
  unitPrimaryId: z.string().min(1, "Primary unit is required"),
  unitSecondaryId: z.string().min(1).optional(),
  unitConversionRate: positiveAmount("Conversion rate").optional(),
  salePriceExclTax: amount("Sale price excluding tax").optional(),
  salePriceInclTax: amount("Sale price including tax").optional(),
  saleDiscountType: z.enum(discountTypes).optional(),
  saleDiscountValue: amount("Sale discount value").optional(),
  purchasePriceExclTax: amount("Purchase price excluding tax").optional(),
  purchasePriceInclTax: amount("Purchase price including tax").optional(),
  taxRateId: z.string().min(1).optional(),
  taxGroupId: z.string().min(1).optional(),
  openingStock: amount("Opening stock").optional(),
  openingStockDate: z
    .string()
    .refine((v) => !Number.isNaN(Date.parse(v)), "Invalid date")
    .optional(),
  openingStockValuePerUnit: amount("Opening stock value per unit").optional(),
  minStockQuantity: amount("Minimum stock quantity").optional(),
  location: trimmedString.max(200).optional(),
} as const;

export const taxRefine = {
  check: (value: Record<string, unknown>) =>
    (value.taxRateId != null) !== (value.taxGroupId != null) ||
    (value.taxRateId == null && value.taxGroupId == null),
  message: "Select either a tax rate or a tax group, not both",
  path: ["taxRateId"] as string[],
};

export const discountRefine = {
  check: (value: Record<string, unknown>) =>
    (value.saleDiscountType != null) === (value.saleDiscountValue != null),
  message: "Both discount type and discount value are required together",
  path: ["saleDiscountType"] as string[],
};

export const conversionRefine = {
  check: (value: Record<string, unknown>) =>
    value.unitSecondaryId == null || value.unitConversionRate != null,
  message: "Conversion rate is required when a secondary unit is selected",
  path: ["unitConversionRate"] as string[],
};

export const createItemSchema = z
  .object(itemFieldShapes)
  .refine(taxRefine.check, {
    message: taxRefine.message,
    path: taxRefine.path,
  })
  .refine(discountRefine.check, {
    message: discountRefine.message,
    path: discountRefine.path,
  })
  .refine(conversionRefine.check, {
    message: conversionRefine.message,
    path: conversionRefine.path,
  });

export const updateItemSchema = z
  .object({
    name: trimmedString.min(1).max(200).optional(),
    itemType: z.enum(itemTypes).optional(),
    itemCode: trimmedString.max(50).nullable().optional(),
    barcode: trimmedString.max(100).nullable().optional(),
    categoryId: z.string().min(1).nullable().optional(),
    hsnSac: trimmedString.max(50).nullable().optional(),
    description: trimmedString.max(5000).nullable().optional(),
    image: z.string().max(800_000, "Image too large").nullable().optional(),
    unitPrimaryId: z.string().min(1).optional(),
    unitSecondaryId: z.string().min(1).nullable().optional(),
    unitConversionRate: positiveAmount("Conversion rate").nullable().optional(),
    salePriceExclTax: amount("Sale price excluding tax").nullable().optional(),
    salePriceInclTax: amount("Sale price including tax").nullable().optional(),
    saleDiscountType: z.enum(discountTypes).nullable().optional(),
    saleDiscountValue: amount("Sale discount value").nullable().optional(),
    purchasePriceExclTax: amount("Purchase price excluding tax").nullable().optional(),
    purchasePriceInclTax: amount("Purchase price including tax").nullable().optional(),
    taxRateId: z.string().min(1).nullable().optional(),
    taxGroupId: z.string().min(1).nullable().optional(),
    openingStock: amount("Opening stock").nullable().optional(),
    openingStockDate: z
      .string()
      .refine((v) => !Number.isNaN(Date.parse(v)), "Invalid date")
      .nullable()
      .optional(),
    openingStockValuePerUnit: amount("Opening stock value per unit").nullable().optional(),
    minStockQuantity: amount("Minimum stock quantity").nullable().optional(),
    location: trimmedString.max(200).nullable().optional(),
  });

export const itemResponseSchema = z.object({
  id: z.string(),
  companyId: z.string(),
  name: z.string(),
  itemType: z.enum(itemTypes),
  itemCode: z.string().nullable(),
  barcode: z.string().nullable(),
  categoryId: z.string().nullable(),
  category: itemCategoryResponseSchema.nullable(),
  hsnSac: z.string().nullable(),
  description: z.string().nullable(),
  image: z.string().nullable(),
  unitPrimaryId: z.string(),
  unitSecondaryId: z.string().nullable(),
  unitPrimary: unitResponseSchema,
  unitSecondary: unitResponseSchema.nullable(),
  unitConversionRate: z.number().nullable(),
  salePriceExclTax: z.number().nullable(),
  salePriceInclTax: z.number().nullable(),
  saleDiscountType: z.enum(discountTypes).nullable(),
  saleDiscountValue: z.number().nullable(),
  purchasePriceExclTax: z.number().nullable(),
  purchasePriceInclTax: z.number().nullable(),
  taxRateId: z.string().nullable(),
  taxGroupId: z.string().nullable(),
  taxRate: taxRateResponseSchema.nullable(),
  taxGroup: taxGroupResponseSchema.nullable(),
  openingStock: z.number().nullable(),
  openingStockDate: z.string().nullable(),
  openingStockValuePerUnit: z.number().nullable(),
  minStockQuantity: z.number().nullable(),
  location: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type ItemDto = z.infer<typeof itemResponseSchema>;
export type CreateItemDto = z.infer<typeof createItemSchema>;
export type UpdateItemDto = z.infer<typeof updateItemSchema>;
