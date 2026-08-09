import { describe, it, expect } from "vitest";
import {
  adjustCashSchema,
  adjustBankSchema,
  createTransferSchema,
} from "./cash.contract";

describe("adjustCashSchema", () => {
  it("accepts a valid cash adjustment", () => {
    const result = adjustCashSchema.safeParse({
      date: "2026-08-08",
      type: "INCREASE",
      amount: 500,
      description: "Petty cash received",
    });
    expect(result.success).toBe(true);
  });

  it("accepts an adjustment without description", () => {
    const result = adjustCashSchema.safeParse({
      date: "2026-08-08",
      type: "DECREASE",
      amount: 100,
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing date", () => {
    const result = adjustCashSchema.safeParse({
      type: "INCREASE",
      amount: 100,
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid date", () => {
    const result = adjustCashSchema.safeParse({
      date: "not-a-date",
      type: "INCREASE",
      amount: 100,
    });
    expect(result.success).toBe(false);
  });

  it("rejects zero or negative amount", () => {
    const zero = adjustCashSchema.safeParse({
      date: "2026-08-08",
      type: "INCREASE",
      amount: 0,
    });
    const negative = adjustCashSchema.safeParse({
      date: "2026-08-08",
      type: "DECREASE",
      amount: -5,
    });
    expect(zero.success).toBe(false);
    expect(negative.success).toBe(false);
  });

  it("rejects invalid type", () => {
    const result = adjustCashSchema.safeParse({
      date: "2026-08-08",
      type: "EXTRA",
      amount: 100,
    });
    expect(result.success).toBe(false);
  });
});

describe("adjustBankSchema", () => {
  it("accepts a valid bank adjustment with image", () => {
    const result = adjustBankSchema.safeParse({
      date: "2026-08-08",
      type: "INCREASE",
      amount: 10000,
      description: "Interest credited",
      image: "data:image/png;base64,abc",
    });
    expect(result.success).toBe(true);
  });

  it("accepts minimal bank adjustment", () => {
    const result = adjustBankSchema.safeParse({
      date: "2026-08-08",
      type: "DECREASE",
      amount: 2000,
    });
    expect(result.success).toBe(true);
  });
});

describe("createTransferSchema", () => {
  it("accepts cash to bank deposit", () => {
    const result = createTransferSchema.safeParse({
      date: "2026-08-08",
      amount: 5000,
      from: "CASH",
      to: "bank_123",
      description: "Cash deposited",
    });
    expect(result.success).toBe(true);
  });

  it("accepts bank to cash withdrawal", () => {
    const result = createTransferSchema.safeParse({
      date: "2026-08-08",
      amount: 3000,
      from: "bank_123",
      to: "CASH",
    });
    expect(result.success).toBe(true);
  });

  it("accepts bank to bank transfer", () => {
    const result = createTransferSchema.safeParse({
      date: "2026-08-08",
      amount: 1000,
      from: "bank_abc",
      to: "bank_xyz",
    });
    expect(result.success).toBe(true);
  });

  it("rejects cash to cash transfer", () => {
    const result = createTransferSchema.safeParse({
      date: "2026-08-08",
      amount: 100,
      from: "CASH",
      to: "CASH",
    });
    expect(result.success).toBe(false);
  });

  it("rejects transfer from and to the same bank", () => {
    const result = createTransferSchema.safeParse({
      date: "2026-08-08",
      amount: 100,
      from: "bank_123",
      to: "bank_123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-positive amount", () => {
    const result = createTransferSchema.safeParse({
      date: "2026-08-08",
      amount: 0,
      from: "CASH",
      to: "bank_123",
    });
    expect(result.success).toBe(false);
  });
});