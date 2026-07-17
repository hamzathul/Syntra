import { describe, it, expect } from "vitest";
import { updateGeneralSettingsSchema } from "./general-settings.contract.js";

describe("updateGeneralSettingsSchema", () => {
  it("accepts valid currency", () => {
    const result = updateGeneralSettingsSchema.safeParse({ businessCurrency: "INR" });
    expect(result.success).toBe(true);
  });

  it("accepts valid decimal places", () => {
    const result = updateGeneralSettingsSchema.safeParse({ decimalPlaces: 2 });
    expect(result.success).toBe(true);
  });

  it("accepts valid date format", () => {
    const result = updateGeneralSettingsSchema.safeParse({ dateFormat: "DD/MM/YYYY" });
    expect(result.success).toBe(true);
  });

  it("accepts empty partial update", () => {
    const result = updateGeneralSettingsSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("rejects invalid currency code", () => {
    const result = updateGeneralSettingsSchema.safeParse({ businessCurrency: "XYZ" });
    expect(result.success).toBe(false);
  });

  it("rejects decimal places less than 1", () => {
    const result = updateGeneralSettingsSchema.safeParse({ decimalPlaces: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects decimal places greater than 5", () => {
    const result = updateGeneralSettingsSchema.safeParse({ decimalPlaces: 6 });
    expect(result.success).toBe(false);
  });

  it("rejects invalid date format", () => {
    const result = updateGeneralSettingsSchema.safeParse({ dateFormat: "YYYY/DD/MM" });
    expect(result.success).toBe(false);
  });

  it("rejects non-integer decimal places", () => {
    const result = updateGeneralSettingsSchema.safeParse({ decimalPlaces: 2.5 });
    expect(result.success).toBe(false);
  });

  it("accepts all valid currencies", () => {
    const validCurrencies = [
      "INR", "USD", "EUR", "GBP", "CAD", "AUD", "JPY", "CNY",
      "SGD", "AED", "CHF", "SAR", "MYR", "THB", "NZD", "ZAR",
      "HKD", "KRW", "SEK", "NOK",
    ];
    for (const code of validCurrencies) {
      const result = updateGeneralSettingsSchema.safeParse({ businessCurrency: code });
      expect(result.success).toBe(true);
    }
  });

  it("accepts all valid date formats", () => {
    const validFormats = [
      "DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD",
      "DD-MM-YYYY", "YYYY/MM/DD", "DD.MM.YYYY",
    ];
    for (const fmt of validFormats) {
      const result = updateGeneralSettingsSchema.safeParse({ dateFormat: fmt });
      expect(result.success).toBe(true);
    }
  });
});
