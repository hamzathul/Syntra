import type { ItemDto, ItemCategoryDto, UnitDto } from "shared";
import { erpApi } from "../../client/erp-client";
import { createCrud, createPaginatedCrud } from "../../client/crud-factory";

export const itemsService = {
  items: createPaginatedCrud<ItemDto>(erpApi, "/items"),
  categories: createCrud<ItemCategoryDto>(erpApi, "/items/categories"),
  units: createCrud<UnitDto>(erpApi, "/items/units"),

  nextCode: (): Promise<{ code: string }> =>
    erpApi.get<{ code: string }>("/items/next-code").then((r) => r.data),

  nextBarcode: (): Promise<{ barcode: string }> =>
    erpApi.get<{ barcode: string }>("/items/next-barcode").then((r) => r.data),
};
