import { describe, it, expect } from "vitest";
import { sanitizeUnknown } from "./sanitize.js";

describe("sanitizeUnknown", () => {
  it("trims string values", () => {
    const result = sanitizeUnknown({ name: "  John  ", email: "  test@test.com  " });
    expect(result).toEqual({ name: "John", email: "test@test.com" });
  });

  it("handles nested objects", () => {
    const result = sanitizeUnknown({
      user: { name: "  John  ", details: { city: "  NYC  " } },
    });
    expect(result).toEqual({
      user: { name: "John", details: { city: "NYC" } },
    });
  });

  it("handles arrays", () => {
    const result = sanitizeUnknown({
      tags: ["  a  ", "  b  ", "  c  "],
    });
    expect(result).toEqual({ tags: ["a", "b", "c"] });
  });

  it("preserves non-string values", () => {
    const result = sanitizeUnknown({
      count: 42,
      active: true,
      data: null,
      nested: { value: 100 },
    });
    expect(result).toEqual({
      count: 42,
      active: true,
      data: null,
      nested: { value: 100 },
    });
  });

  it("returns empty object as-is", () => {
    expect(sanitizeUnknown({})).toEqual({});
  });
});
