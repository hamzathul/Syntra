import { z } from "zod/v4";

export const itemSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  sku: z.string().min(1),
  description: z.string().optional(),
  unitPrice: z.number().nonnegative(),
  stockQty: z.number().int().nonnegative(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const saleSchema = z.object({
  id: z.string(),
  referenceNo: z.string(),
  customerId: z.string().optional(),
  totalAmount: z.number().nonnegative(),
  status: z.enum(["DRAFT", "CONFIRMED", "CANCELLED"]),
  saleDate: z.string(),
  createdAt: z.string(),
});

export const purchaseSchema = z.object({
  id: z.string(),
  referenceNo: z.string(),
  supplierId: z.string().optional(),
  totalAmount: z.number().nonnegative(),
  status: z.enum(["DRAFT", "RECEIVED", "CANCELLED"]),
  purchaseDate: z.string(),
  createdAt: z.string(),
});

export type ItemDto = z.infer<typeof itemSchema>;
export type SaleDto = z.infer<typeof saleSchema>;
export type PurchaseDto = z.infer<typeof purchaseSchema>;
