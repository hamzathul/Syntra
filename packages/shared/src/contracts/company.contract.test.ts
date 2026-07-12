import { describe, it, expect } from "vitest";
import { createCompanySchema } from "./company.contract.js";

describe("createCompanySchema", () => {
  it("accepts valid company name", () => {
    const result = createCompanySchema.safeParse({ name: "Acme Corp" });
    expect(result.success).toBe(true);
  });

  it("rejects empty name", () => {
    const result = createCompanySchema.safeParse({ name: "" });
    expect(result.success).toBe(false);
  });

  it("rejects name shorter than 2 characters", () => {
    const result = createCompanySchema.safeParse({ name: "A" });
    expect(result.success).toBe(false);
  });

  it("rejects name longer than 100 characters", () => {
    const result = createCompanySchema.safeParse({
      name: "A".repeat(101),
    });
    expect(result.success).toBe(false);
  });

  it("strips whitespace from name", () => {
    const result = createCompanySchema.safeParse({ name: "  Acme Corp  " });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("Acme Corp");
    }
  });
});
