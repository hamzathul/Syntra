import { describe, it, expect } from "vitest";
import { extractBearerToken } from "./bearer-token.js";

describe("extractBearerToken", () => {
  it("extracts token from valid Bearer header", () => {
    const result = extractBearerToken("Bearer eyJhbGciOiJIUzI1NiJ9.xxx");
    expect(result).toBe("eyJhbGciOiJIUzI1NiJ9.xxx");
  });

  it("throws for empty header", () => {
    expect(() => extractBearerToken()).toThrow("A valid bearer token is required");
    expect(() => extractBearerToken("")).toThrow();
  });

  it("throws for malformed header", () => {
    expect(() => extractBearerToken("Basic xxx")).toThrow();
    expect(() => extractBearerToken("Bearer")).toThrow();
  });
});
