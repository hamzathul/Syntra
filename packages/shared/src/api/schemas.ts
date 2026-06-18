import { z } from "zod";

export const cursorPaginationMetaSchema = z.object({
  nextCursor: z.string().nullable(),
  previousCursor: z.string().nullable().optional(),
  limit: z.number().int().positive(),
  hasNextPage: z.boolean(),
});

export const apiResponseMetaSchema = z.object({
  requestId: z.string().optional(),
  timestamp: z.string().datetime(),
  version: z.literal("v1"),
  pagination: cursorPaginationMetaSchema.optional(),
});

export const apiErrorDetailSchema = z.object({
  code: z.string(),
  message: z.string(),
  path: z.string().optional(),
});

export const apiErrorResponseSchema = z.object({
  status: z.literal("error"),
  message: z.string(),
  error: z.object({
    code: z.string(),
    details: z.array(apiErrorDetailSchema).optional(),
  }),
  meta: apiResponseMetaSchema,
});

export const createApiSuccessResponseSchema = <TDataSchema extends z.ZodType>(
  dataSchema: TDataSchema,
) =>
  z.object({
    status: z.literal("success"),
    message: z.string(),
    data: dataSchema,
    meta: apiResponseMetaSchema,
  });
