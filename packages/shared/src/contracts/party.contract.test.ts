import { describe, it, expect } from "vitest";
import { createPartySchema, updatePartySchema } from "./party.contract";

const validParty = { name: "Acme Traders" };

describe("createPartySchema", () => {
  it("accepts minimal valid party", () => {
    const result = createPartySchema.safeParse(validParty);
    expect(result.success).toBe(true);
  });

  it("accepts full party with opening balance", () => {
    const result = createPartySchema.safeParse({
      ...validParty,
      contactNumber: "9876543210",
      openingBalanceAmount: 2500.5,
      openingBalanceType: "TO_RECEIVE",
      openingBalanceDate: "2026-08-01",
      creditLimit: 100000,
      billingAddress: "12 Main Street, Mumbai",
      email: "billing@acme.com",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty party name", () => {
    const result = createPartySchema.safeParse({ name: "   " });
    expect(result.success).toBe(false);
  });

  it("rejects negative opening balance", () => {
    const result = createPartySchema.safeParse({
      ...validParty,
      openingBalanceAmount: -100,
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid opening balance type", () => {
    const result = createPartySchema.safeParse({
      ...validParty,
      openingBalanceType: "TO_MAYBE",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid opening balance date", () => {
    const result = createPartySchema.safeParse({
      ...validParty,
      openingBalanceDate: "not-a-date",
    });
    expect(result.success).toBe(false);
  });
});

describe("updatePartySchema", () => {
  it("accepts empty partial update", () => {
    const result = updatePartySchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("accepts updating a single field", () => {
    const result = updatePartySchema.safeParse({ contactNumber: "9000000000" });
    expect(result.success).toBe(true);
  });

  it("accepts nullable optional fields to clear them", () => {
    const result = updatePartySchema.safeParse({
      billingAddress: null,
      creditLimit: null,
    });
    expect(result.success).toBe(true);
  });
});