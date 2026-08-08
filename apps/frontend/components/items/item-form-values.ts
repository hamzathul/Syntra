import { z } from "zod";
import type { CreateItemDto, ItemDto, UpdateItemDto } from "shared";

const money = (label: string) =>
  z
    .string()
    .refine(
      (v) => {
        if (v.trim() === "") return true;
        const n = Number(v);
        return Number.isFinite(n) && n >= 0 && n <= 999_999_999_999;
      },
      `${label} must be a valid non-negative amount`,
    );

export const itemFormSchema = z
  .object({
    name: z.string().trim().min(1, "Item name is required").max(200, "Item name too long"),
    itemType: z.enum(["GOODS", "SERVICE"]),
    itemCode: z.string().max(50, "Item code too long"),
    barcode: z.string().max(100, "Barcode too long"),
    categoryId: z.string(),
    hsnSac: z.string().max(50, "HSN/SAC code too long"),
    description: z.string().max(5000, "Description too long"),
    image: z.string().nullable(),
    unitPrimaryId: z.string(),
    unitSecondaryId: z.string(),
    unitConversionRate: money("Conversion rate"),
    salePriceExclTax: money("Sale price excluding tax"),
    salePriceInclTax: money("Sale price including tax"),
    saleDiscountType: z.enum(["", "AMOUNT", "PERCENTAGE"]),
    saleDiscountValue: money("Sale discount value"),
    purchasePriceExclTax: money("Purchase price excluding tax"),
    purchasePriceInclTax: money("Purchase price including tax"),
    taxRateId: z.string(),
    taxGroupId: z.string(),
    openingStock: money("Opening stock"),
    openingStockDate: z.string(),
    openingStockValuePerUnit: money("Opening stock value per unit"),
    minStockQuantity: money("Minimum stock quantity"),
    location: z.string().max(200, "Location too long"),
  })
  .superRefine((values, ctx) => {
    if (values.unitPrimaryId.trim() === "") {
      ctx.addIssue({
        code: "custom",
        path: ["unitPrimaryId"],
        message: "Primary unit is required",
      });
    }
    if (values.taxRateId !== "" && values.taxGroupId !== "") {
      ctx.addIssue({
        code: "custom",
        path: ["taxRateId"],
        message: "Select either a tax rate or a tax group, not both",
      });
    }
    if (
      (values.saleDiscountType !== "") !==
      (values.saleDiscountValue.trim() !== "")
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["saleDiscountType"],
        message: "Both discount type and discount value are required together",
      });
    }
    if (values.unitSecondaryId !== "" && values.unitConversionRate.trim() === "") {
      ctx.addIssue({
        code: "custom",
        path: ["unitConversionRate"],
        message: "Conversion rate is required when a secondary unit is selected",
      });
    }
  });

export type ItemFormValues = z.infer<typeof itemFormSchema>;

export function emptyItemFormValues(): ItemFormValues {
  return {
    name: "",
    itemType: "GOODS",
    itemCode: "",
    barcode: "",
    categoryId: "",
    hsnSac: "",
    description: "",
    image: null,
    unitPrimaryId: "",
    unitSecondaryId: "",
    unitConversionRate: "",
    salePriceExclTax: "",
    salePriceInclTax: "",
    saleDiscountType: "",
    saleDiscountValue: "",
    purchasePriceExclTax: "",
    purchasePriceInclTax: "",
    taxRateId: "",
    taxGroupId: "",
    openingStock: "",
    openingStockDate: "",
    openingStockValuePerUnit: "",
    minStockQuantity: "",
    location: "",
  };
}

export function itemFormValuesFromDto(item: ItemDto): ItemFormValues {
  const num = (v: number | null) => (v === null ? "" : String(v));
  return {
    name: item.name,
    itemType: item.itemType,
    itemCode: item.itemCode ?? "",
    barcode: item.barcode ?? "",
    categoryId: item.categoryId ?? "",
    hsnSac: item.hsnSac ?? "",
    description: item.description ?? "",
    image: item.image,
    unitPrimaryId: item.unitPrimaryId,
    unitSecondaryId: item.unitSecondaryId ?? "",
    unitConversionRate: num(item.unitConversionRate),
    salePriceExclTax: num(item.salePriceExclTax),
    salePriceInclTax: num(item.salePriceInclTax),
    saleDiscountType: item.saleDiscountType ?? "",
    saleDiscountValue: num(item.saleDiscountValue),
    purchasePriceExclTax: num(item.purchasePriceExclTax),
    purchasePriceInclTax: num(item.purchasePriceInclTax),
    taxRateId: item.taxRateId ?? "",
    taxGroupId: item.taxGroupId ?? "",
    openingStock: num(item.openingStock),
    openingStockDate: item.openingStockDate
      ? item.openingStockDate.slice(0, 10)
      : "",
    openingStockValuePerUnit: num(item.openingStockValuePerUnit),
    minStockQuantity: num(item.minStockQuantity),
    location: item.location ?? "",
  };
}

const optStr = (v: string) => (v.trim() === "" ? undefined : v.trim());
const optNum = (v: string) => (v.trim() === "" ? undefined : Number(v));
const numOrNull = (v: string) => (v.trim() === "" ? null : Number(v));
const strOrNull = (v: string) => (v.trim() === "" ? null : v.trim());
const dateOrNull = (v: string) => (v === "" ? null : v);

export function toCreateItemPayload(values: ItemFormValues): CreateItemDto {
  const payload: Record<string, unknown> = {
    name: values.name.trim(),
    itemType: values.itemType,
    unitPrimaryId: values.unitPrimaryId,
  };

  const optional: Array<[keyof CreateItemDto, unknown]> = [
    ["itemCode", optStr(values.itemCode)],
    ["barcode", optStr(values.barcode)],
    ["categoryId", optStr(values.categoryId)],
    ["hsnSac", optStr(values.hsnSac)],
    ["description", optStr(values.description)],
    ["image", optStr(values.image ?? "")],
    ["unitSecondaryId", optStr(values.unitSecondaryId)],
    ["unitConversionRate", optNum(values.unitConversionRate)],
    ["salePriceExclTax", optNum(values.salePriceExclTax)],
    ["salePriceInclTax", optNum(values.salePriceInclTax)],
    ["saleDiscountType", values.saleDiscountType || undefined],
    ["saleDiscountValue", optNum(values.saleDiscountValue)],
    ["purchasePriceExclTax", optNum(values.purchasePriceExclTax)],
    ["purchasePriceInclTax", optNum(values.purchasePriceInclTax)],
    ["taxRateId", optStr(values.taxRateId)],
    ["taxGroupId", optStr(values.taxGroupId)],
    ["openingStock", optNum(values.openingStock)],
    ["openingStockDate", dateOrNull(values.openingStockDate) || undefined],
    ["openingStockValuePerUnit", optNum(values.openingStockValuePerUnit)],
    ["minStockQuantity", optNum(values.minStockQuantity)],
    ["location", optStr(values.location)],
  ];

  for (const [key, value] of optional) {
    if (value !== undefined) payload[key] = value;
  }

  return payload as CreateItemDto;
}

export function toUpdateItemPayload(values: ItemFormValues): UpdateItemDto {
  const payload: Record<string, unknown> = {
    name: values.name.trim(),
    itemType: values.itemType,
    unitPrimaryId: values.unitPrimaryId,
  };

  const nullable: Array<[keyof UpdateItemDto, unknown]> = [
    ["itemCode", strOrNull(values.itemCode)],
    ["barcode", strOrNull(values.barcode)],
    ["categoryId", strOrNull(values.categoryId)],
    ["hsnSac", strOrNull(values.hsnSac)],
    ["description", strOrNull(values.description)],
    ["image", values.image],
    ["unitSecondaryId", strOrNull(values.unitSecondaryId)],
    ["unitConversionRate", numOrNull(values.unitConversionRate)],
    ["salePriceExclTax", numOrNull(values.salePriceExclTax)],
    ["salePriceInclTax", numOrNull(values.salePriceInclTax)],
    ["saleDiscountType", values.saleDiscountType || null],
    ["saleDiscountValue", numOrNull(values.saleDiscountValue)],
    ["purchasePriceExclTax", numOrNull(values.purchasePriceExclTax)],
    ["purchasePriceInclTax", numOrNull(values.purchasePriceInclTax)],
    ["taxRateId", strOrNull(values.taxRateId)],
    ["taxGroupId", strOrNull(values.taxGroupId)],
    ["openingStock", numOrNull(values.openingStock)],
    ["openingStockDate", dateOrNull(values.openingStockDate)],
    ["openingStockValuePerUnit", numOrNull(values.openingStockValuePerUnit)],
    ["minStockQuantity", numOrNull(values.minStockQuantity)],
    ["location", strOrNull(values.location)],
  ];

  for (const [key, value] of nullable) {
    payload[key] = value;
  }

  return payload as UpdateItemDto;
}