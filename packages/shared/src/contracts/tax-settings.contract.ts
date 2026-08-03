import { z } from "zod";

const trimmedString = z.string().trim();

export const createTaxRateSchema = z.object({
  name: trimmedString.min(1, "Tax rate name is required"),
  rate: z
    .number()
    .positive("Rate must be positive")
    .max(999.99, "Rate must not exceed 999.99")
    .multipleOf(0.01, "Rate must have at most 2 decimal places"),
});

export const updateTaxRateSchema = z.object({
  name: trimmedString.min(1).optional(),
  rate: z.number().positive().max(999.99).multipleOf(0.01).optional(),
});

export const taxRateResponseSchema = z.object({
  id: z.string(),
  companyId: z.string(),
  name: z.string(),
  rate: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type TaxRateDto = z.infer<typeof taxRateResponseSchema>;

export const createTaxGroupSchema = z.object({
  name: trimmedString.min(1, "Tax group name is required"),
  taxRateIds: z
    .array(z.string())
    .min(1, "At least one tax rate must be selected")
    .refine(
      (ids) => new Set(ids).size === ids.length,
      "Duplicate tax rate IDs are not allowed",
    ),
});

export const updateTaxGroupSchema = z.object({
  name: trimmedString.min(1).optional(),
  taxRateIds: z
    .array(z.string())
    .min(1)
    .refine(
      (ids) => new Set(ids).size === ids.length,
      "Duplicate tax rate IDs are not allowed",
    )
    .optional(),
});

export const taxGroupResponseSchema = z.object({
  id: z.string(),
  companyId: z.string(),
  name: z.string(),
  rates: z.array(taxRateResponseSchema),
  totalRate: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type TaxGroupDto = z.infer<typeof taxGroupResponseSchema>;

export type CreateTaxRateDto = z.infer<typeof createTaxRateSchema>;
export type UpdateTaxRateDto = z.infer<typeof updateTaxRateSchema>;
export type CreateTaxGroupDto = z.infer<typeof createTaxGroupSchema>;
export type UpdateTaxGroupDto = z.infer<typeof updateTaxGroupSchema>;
