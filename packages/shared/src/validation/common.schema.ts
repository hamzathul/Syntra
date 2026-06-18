import { z } from "zod";

export const emptyObjectSchema = z.object({}).strict();

export const cursorPaginationRequestSchema = z.object({
  cursor: z.string().min(1).optional(),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type CursorPaginationRequest = z.infer<
  typeof cursorPaginationRequestSchema
>;
