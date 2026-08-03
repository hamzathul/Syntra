import type {
  CreateItemDto,
  DiscountType,
  ItemDto,
  ItemType,
  UpdateItemDto,
} from "shared";

export interface ItemFormState {
  name: string;
  itemType: ItemType;
  itemCode: string;
  barcode: string;
  categoryId: string;
  hsnSac: string;
  description: string;
  image: string | null;
  unitPrimaryId: string;
  unitSecondaryId: string;
  unitConversionRate: string;
  salePriceExclTax: string;
  salePriceInclTax: string;
  saleDiscountType: DiscountType | "";
  saleDiscountValue: string;
  purchasePriceExclTax: string;
  purchasePriceInclTax: string;
  taxRateId: string;
  taxGroupId: string;
  openingStock: string;
  openingStockDate: string;
  openingStockValuePerUnit: string;
  minStockQuantity: string;
  location: string;
}

export function emptyItemFormState(): ItemFormState {
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

export function itemFormStateFromDto(item: ItemDto): ItemFormState {
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
const optNum = (v: string) => (v.trim() === "" ? undefined : parseFloat(v));
const numOrNull = (v: string) => (v.trim() === "" ? null : parseFloat(v));
const strOrNull = (v: string) => (v.trim() === "" ? null : v.trim());
const dateOrNull = (v: string) => (v === "" ? null : v);

export function toCreateItemPayload(state: ItemFormState): CreateItemDto {
  const payload: Record<string, unknown> = {
    name: state.name.trim(),
    itemType: state.itemType,
  };

  const optional: Array<[keyof CreateItemDto, unknown]> = [
    ["itemCode", optStr(state.itemCode)],
    ["barcode", optStr(state.barcode)],
    ["categoryId", optStr(state.categoryId)],
    ["hsnSac", optStr(state.hsnSac)],
    ["description", optStr(state.description)],
    ["image", optStr(state.image ?? "")],
    ["unitSecondaryId", optStr(state.unitSecondaryId)],
    ["unitConversionRate", optNum(state.unitConversionRate)],
    ["salePriceExclTax", optNum(state.salePriceExclTax)],
    ["salePriceInclTax", optNum(state.salePriceInclTax)],
    ["saleDiscountType", state.saleDiscountType || undefined],
    ["saleDiscountValue", optNum(state.saleDiscountValue)],
    ["purchasePriceExclTax", optNum(state.purchasePriceExclTax)],
    ["purchasePriceInclTax", optNum(state.purchasePriceInclTax)],
    ["taxRateId", optStr(state.taxRateId)],
    ["taxGroupId", optStr(state.taxGroupId)],
    ["openingStock", optNum(state.openingStock)],
    ["openingStockDate", dateOrNull(state.openingStockDate) || undefined],
    ["openingStockValuePerUnit", optNum(state.openingStockValuePerUnit)],
    ["minStockQuantity", optNum(state.minStockQuantity)],
    ["location", optStr(state.location)],
  ];

  for (const [key, value] of optional) {
    if (value !== undefined) payload[key] = value;
  }

  payload.unitPrimaryId = state.unitPrimaryId;
  return payload as CreateItemDto;
}

export function toUpdateItemPayload(state: ItemFormState): UpdateItemDto {
  const payload: Record<string, unknown> = {
    name: state.name.trim(),
    itemType: state.itemType,
    unitPrimaryId: state.unitPrimaryId,
  };

  const nullable: Array<[string, unknown]> = [
    ["itemCode", strOrNull(state.itemCode)],
    ["barcode", strOrNull(state.barcode)],
    ["categoryId", strOrNull(state.categoryId)],
    ["hsnSac", strOrNull(state.hsnSac)],
    ["description", strOrNull(state.description)],
    ["image", state.image],
    ["unitSecondaryId", strOrNull(state.unitSecondaryId)],
    ["unitConversionRate", numOrNull(state.unitConversionRate)],
    ["salePriceExclTax", numOrNull(state.salePriceExclTax)],
    ["salePriceInclTax", numOrNull(state.salePriceInclTax)],
    ["saleDiscountType", state.saleDiscountType || null],
    ["saleDiscountValue", numOrNull(state.saleDiscountValue)],
    ["purchasePriceExclTax", numOrNull(state.purchasePriceExclTax)],
    ["purchasePriceInclTax", numOrNull(state.purchasePriceInclTax)],
    ["taxRateId", strOrNull(state.taxRateId)],
    ["taxGroupId", strOrNull(state.taxGroupId)],
    ["openingStock", numOrNull(state.openingStock)],
    ["openingStockDate", dateOrNull(state.openingStockDate)],
    ["openingStockValuePerUnit", numOrNull(state.openingStockValuePerUnit)],
    ["minStockQuantity", numOrNull(state.minStockQuantity)],
    ["location", strOrNull(state.location)],
  ];

  for (const [key, value] of nullable) {
    payload[key] = value;
  }

  return payload as UpdateItemDto;
}
