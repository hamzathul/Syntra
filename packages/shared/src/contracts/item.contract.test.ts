import { describe, it, expect } from "vitest";
import {
  createItemSchema,
  updateItemSchema,
  createUnitSchema,
  updateUnitSchema,
  createItemCategorySchema,
} from "./item.contract";

const validItem = {
  name: "Steel Pipe",
  itemType: "GOODS",
  unitPrimaryId: "unit-1",
};

describe("createUnitSchema", () => {
  it("accepts valid unit with shortName", () => {
    const result = createUnitSchema.safeParse({ name: "Kilogram", shortName: "kg" });
    expect(result.success).toBe(true);
  });

  it("accepts unit without shortName", () => {
    const result = createUnitSchema.safeParse({ name: "Unit" });
    expect(result.success).toBe(true);
  });

  it("rejects empty name", () => {
    const result = createUnitSchema.safeParse({ name: "  " });
    expect(result.success).toBe(false);
  });
});

describe("updateUnitSchema", () => {
  it("accepts empty partial update", () => {
    const result = updateUnitSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("accepts nullable shortName to clear it", () => {
    const result = updateUnitSchema.safeParse({ shortName: null });
    expect(result.success).toBe(true);
  });
});

describe("createItemCategorySchema", () => {
  it("accepts valid category", () => {
    const result = createItemCategorySchema.safeParse({ name: "Electronics" });
    expect(result.success).toBe(true);
  });

  it("rejects empty category name", () => {
    const result = createItemCategorySchema.safeParse({ name: "" });
    expect(result.success).toBe(false);
  });
});

describe("createItemSchema", () => {
  it("accepts minimal valid item", () => {
    const result = createItemSchema.safeParse(validItem);
    expect(result.success).toBe(true);
  });

  it("accepts full item with secondary unit and conversion rate", () => {
    const result = createItemSchema.safeParse({
      ...validItem,
      unitSecondaryId: "unit-2",
      unitConversionRate: 1000,
      salePriceExclTax: 100,
      salePriceInclTax: 118,
      saleDiscountType: "PERCENTAGE",
      saleDiscountValue: 10,
      purchasePriceExclTax: 80,
      taxRateId: "rate-1",
      openingStock: 50,
      openingStockDate: "2026-01-01",
      openingStockValuePerUnit: 75,
      minStockQuantity: 5,
      location: "Warehouse A",
      hsnSac: "7306",
      description: "A sturdy pipe",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty item name", () => {
    const result = createItemSchema.safeParse({ name: "", unitPrimaryId: "u1" });
    expect(result.success).toBe(false);
  });

  it("rejects missing primary unit", () => {
    const result = createItemSchema.safeParse({ name: "Pipe" });
    expect(result.success).toBe(false);
  });

  it("rejects both taxRateId and taxGroupId", () => {
    const result = createItemSchema.safeParse({
      ...validItem,
      taxRateId: "rate-1",
      taxGroupId: "group-1",
    });
    expect(result.success).toBe(false);
  });

  it("accepts taxGroupId alone", () => {
    const result = createItemSchema.safeParse({
      ...validItem,
      taxGroupId: "group-1",
    });
    expect(result.success).toBe(true);
  });

  it("rejects discount value without discount type", () => {
    const result = createItemSchema.safeParse({
      ...validItem,
      saleDiscountValue: 10,
    });
    expect(result.success).toBe(false);
  });

  it("rejects discount type without discount value", () => {
    const result = createItemSchema.safeParse({
      ...validItem,
      saleDiscountType: "AMOUNT",
    });
    expect(result.success).toBe(false);
  });

  it("rejects secondary unit without conversion rate", () => {
    const result = createItemSchema.safeParse({
      ...validItem,
      unitSecondaryId: "unit-2",
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative price", () => {
    const result = createItemSchema.safeParse({
      ...validItem,
      salePriceExclTax: -5,
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid item type", () => {
    const result = createItemSchema.safeParse({
      ...validItem,
      itemType: "TOOL",
    });
    expect(result.success).toBe(false);
  });
});

describe("updateItemSchema", () => {
  it("accepts empty partial update", () => {
    const result = updateItemSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("accepts updating only a single field", () => {
    const result = updateItemSchema.safeParse({ salePriceExclTax: 120 });
    expect(result.success).toBe(true);
  });

  it("accepts updating name and primary unit", () => {
    const result = updateItemSchema.safeParse({
      name: "New name",
      unitPrimaryId: "unit-9",
    });
    expect(result.success).toBe(true);
  });
});
