import { z } from "zod";

export const createTaxRateSchema = z.object({
  name: z.string().min(1, "Tax rate name is required"),
  rate: z.number().positive("Rate must be positive"),
});

export const updateTaxRateSchema = z.object({
  name: z.string().min(1).optional(),
  rate: z.number().positive().optional(),
});

export interface TaxRateDto {
  readonly id: string;
  readonly companyId: string;
  readonly name: string;
  readonly rate: number;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export const createTaxGroupSchema = z.object({
  name: z.string().min(1, "Tax group name is required"),
  taxRateIds: z.array(z.string()).min(1, "At least one tax rate must be selected"),
});

export const updateTaxGroupSchema = z.object({
  name: z.string().min(1).optional(),
  taxRateIds: z.array(z.string()).min(1).optional(),
});

export interface TaxGroupDto {
  readonly id: string;
  readonly companyId: string;
  readonly name: string;
  readonly rates: TaxRateDto[];
  readonly totalRate: number;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export type CreateTaxRateDto = z.infer<typeof createTaxRateSchema>;
export type UpdateTaxRateDto = z.infer<typeof updateTaxRateSchema>;
export type CreateTaxGroupDto = z.infer<typeof createTaxGroupSchema>;
export type UpdateTaxGroupDto = z.infer<typeof updateTaxGroupSchema>;
