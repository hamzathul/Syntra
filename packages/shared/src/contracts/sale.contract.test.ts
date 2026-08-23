import { describe, it, expect } from "vitest";
import { createSaleSchema, updateSaleSchema } from "./sale.contract";

const baseSale = {
  partyId: "party_123",
  saleType: "CREDIT",
  saleDate: "2026-08-11",
  totalAmount: 10000,
  receivedAmount: 4000,
  description: "Credit sale",
};

describe("createSaleSchema", () => {
  it("accepts a credit sale with payments matching received amount", () => {
    const result = createSaleSchema.safeParse({
      ...baseSale,
      payments: [{ mode: "CASH", amount: 3000 }, { mode: "BANK", amount: 1000, bankId: "bank_123" }],
    });
    expect(result.success).toBe(true);
  });

  it("accepts a credit sale with a cheque payment", () => {
    const result = createSaleSchema.safeParse({
      ...baseSale,
      payments: [
        {
          mode: "CHEQUE",
          amount: 4000,
          cheque: {
            drawBankName: "HDFC Bank",
            chequeNumber: "CHQ-001",
            chequeDate: "2026-08-11",
          },
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("accepts a cash sale without an explicit received amount", () => {
    const result = createSaleSchema.safeParse({
      partyId: "party_123",
      saleType: "CASH",
      totalAmount: 5000,
      payments: [{ mode: "CASH", amount: 5000 }],
    });
    expect(result.success).toBe(true);
  });

  it("rejects payments that do not total the received amount", () => {
    const result = createSaleSchema.safeParse({
      ...baseSale,
      payments: [{ mode: "CASH", amount: 2500 }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects received amount greater than total", () => {
    const result = createSaleSchema.safeParse({
      ...baseSale,
      receivedAmount: 15000,
      payments: [{ mode: "CASH", amount: 15000 }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects a bank payment without bankId", () => {
    const result = createSaleSchema.safeParse({
      ...baseSale,
      payments: [{ mode: "BANK", amount: 4000 }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects a cheque payment without cheque details", () => {
    const result = createSaleSchema.safeParse({
      ...baseSale,
      payments: [{ mode: "CHEQUE", amount: 4000 }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid saleType", () => {
    const result = createSaleSchema.safeParse({
      ...baseSale,
      saleType: "INSTALLMENT",
      payments: [{ mode: "CASH", amount: 4000 }],
    });
    expect(result.success).toBe(false);
  });
});

describe("updateSaleSchema", () => {
  it("does not allow changing saleType", () => {
    const result = updateSaleSchema.safeParse({
      saleType: "CASH",
      totalAmount: 20000,
    });
    expect(result.success).toBe(false);
  });

  it("accepts editing only the description", () => {
    const result = updateSaleSchema.safeParse({
      description: "Updated note",
    });
    expect(result.success).toBe(true);
  });

  it("accepts updating payments that total the received amount", () => {
    const result = updateSaleSchema.safeParse({
      receivedAmount: 6000,
      payments: [{ mode: "CASH", amount: 6000 }],
    });
    expect(result.success).toBe(true);
  });
});
