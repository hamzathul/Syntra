import { describe, it, expect } from "vitest";
import { createBankSchema, updateBankSchema } from "./bank.contract";

const validBank = { name: "HDFC Bank - Current" };

describe("createBankSchema", () => {
  it("accepts minimal valid bank", () => {
    const result = createBankSchema.safeParse(validBank);
    expect(result.success).toBe(true);
  });

  it("accepts bank with opening balance and date", () => {
    const result = createBankSchema.safeParse({
      ...validBank,
      openingBalance: 50000,
      openingBalanceDate: "2026-01-04",
    });
    expect(result.success).toBe(true);
  });

  it("accepts bank with bank details printing enabled and account number", () => {
    const result = createBankSchema.safeParse({
      ...validBank,
      printBankDetails: true,
      accountHolderName: "Syntra Pvt Ltd",
      accountNumber: "50100123456789",
      ifscCode: "HDFC0001234",
      branchName: "Koramangala",
    });
    expect(result.success).toBe(true);
  });

  it("rejects bank details printing without account number", () => {
    const result = createBankSchema.safeParse({
      ...validBank,
      printBankDetails: true,
      accountNumber: undefined,
    });
    expect(result.success).toBe(false);
  });

  it("accepts UPI QR printing with optional UPI ID", () => {
    const result = createBankSchema.safeParse({
      ...validBank,
      printUpiQr: true,
      upiId: "syntra@hdfc",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty bank name", () => {
    const result = createBankSchema.safeParse({ name: "   " });
    expect(result.success).toBe(false);
  });

  it("rejects negative opening balance", () => {
    const result = createBankSchema.safeParse({
      ...validBank,
      openingBalance: -100,
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid opening balance date", () => {
    const result = createBankSchema.safeParse({
      ...validBank,
      openingBalanceDate: "not-a-date",
    });
    expect(result.success).toBe(false);
  });
});

describe("updateBankSchema", () => {
  it("accepts empty partial update", () => {
    const result = updateBankSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("accepts updating a single field", () => {
    const result = updateBankSchema.safeParse({ branchName: "Indiranagar" });
    expect(result.success).toBe(true);
  });

  it("accepts nullable optional fields to clear them", () => {
    const result = updateBankSchema.safeParse({
      upiId: null,
      accountNumber: null,
    });
    expect(result.success).toBe(true);
  });

  it("rejects enabling bank details without account number", () => {
    const result = updateBankSchema.safeParse({
      printBankDetails: true,
      accountNumber: undefined,
    });
    expect(result.success).toBe(false);
  });
});