import { describe, it, expect } from "vitest";
import { chatRequestSchema, chatResponseSchema } from "./ai-chat.contract";

describe("chatRequestSchema", () => {
  it("accepts a message without thread_id", () => {
    const result = chatRequestSchema.safeParse({
      message: "Sales last month?",
    });
    expect(result.success).toBe(true);
  });

  it("accepts a message with thread_id", () => {
    const result = chatRequestSchema.safeParse({
      message: "hi",
      thread_id: "thread-123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an empty message", () => {
    const result = chatRequestSchema.safeParse({ message: "" });
    expect(result.success).toBe(false);
  });

  it("rejects a message over 2000 characters", () => {
    const result = chatRequestSchema.safeParse({ message: "x".repeat(2001) });
    expect(result.success).toBe(false);
  });

  it("rejects a thread_id over 64 characters", () => {
    const result = chatRequestSchema.safeParse({
      message: "hi",
      thread_id: "x".repeat(65),
    });
    expect(result.success).toBe(false);
  });
});

describe("chatResponseSchema", () => {
  it("accepts a full reply", () => {
    const result = chatResponseSchema.safeParse({
      reply: "Total is 1500.",
      thread_id: "thread-123",
      tool_calls: ["get_sales_summary"],
    });
    expect(result.success).toBe(true);
  });

  it("rejects a missing reply", () => {
    const result = chatResponseSchema.safeParse({
      thread_id: "thread-123",
      tool_calls: [],
    });
    expect(result.success).toBe(false);
  });
});
