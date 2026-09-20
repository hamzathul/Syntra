import { z } from "zod";

// Mirrors the AI service Pydantic models (apps/ai/src/ai/modules/chat/schemas.py).
// The Python service remains the runtime validator; these schemas are the
// TypeScript-side single source of truth for the chat API contract.
export const chatRequestSchema = z.object({
  message: z.string().min(1).max(2000),
  thread_id: z.string().max(64).optional(),
});

export const chatResponseSchema = z.object({
  reply: z.string(),
  thread_id: z.string(),
  tool_calls: z.array(z.string()),
});

export type ChatRequestDto = z.infer<typeof chatRequestSchema>;
export type ChatResponseDto = z.infer<typeof chatResponseSchema>;
