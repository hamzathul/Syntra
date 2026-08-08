import { z } from "zod";

export const openingBalanceTypes = ["TO_PAY", "TO_RECEIVE"] as const;
export type OpeningBalanceType = (typeof openingBalanceTypes)[number];

const trimmedString = z.string().trim();

const MAX_AMOUNT = 99_999_999_999.99;

const amount = (label: string) =>
  z
    .number()
    .nonnegative(`${label} must be non-negative`)
    .max(MAX_AMOUNT, `${label} must be at most 11 integer digits`)
    .multipleOf(0.0001, `${label} must have at most 4 decimal places`);

const dateString = z.iso.date("Invalid date");

export const listPartiesQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional(),
  cursor: z.string().min(1).optional(),
});

export const createPartySchema = z.object({
  name: trimmedString.min(1, "Party name is required").max(200),
  contactNumber: trimmedString.max(50).optional(),
  openingBalanceAmount: amount("Opening balance amount").optional(),
  openingBalanceType: z.enum(openingBalanceTypes).optional(),
  openingBalanceDate: dateString.optional(),
  creditLimit: amount("Credit limit").optional(),
  billingAddress: trimmedString.max(2000).optional(),
  email: trimmedString.max(200).optional(),
});

export const updatePartySchema = z.object({
  name: trimmedString.min(1).max(200).optional(),
  contactNumber: trimmedString.max(50).nullable().optional(),
  openingBalanceAmount: amount("Opening balance amount").nullable().optional(),
  openingBalanceType: z.enum(openingBalanceTypes).nullable().optional(),
  openingBalanceDate: dateString.nullable().optional(),
  creditLimit: amount("Credit limit").nullable().optional(),
  billingAddress: trimmedString.max(2000).nullable().optional(),
  email: trimmedString.max(200).nullable().optional(),
});

export const partyResponseSchema = z.object({
  id: z.string(),
  companyId: z.string(),
  name: z.string(),
  contactNumber: z.string().nullable(),
  openingBalanceAmount: z.number().nullable(),
  openingBalanceType: z.enum(openingBalanceTypes).nullable(),
  openingBalanceDate: z.string().nullable(),
  creditLimit: z.number().nullable(),
  billingAddress: z.string().nullable(),
  email: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type PartyDto = z.infer<typeof partyResponseSchema>;
export type CreatePartyDto = z.infer<typeof createPartySchema>;
export type UpdatePartyDto = z.infer<typeof updatePartySchema>;