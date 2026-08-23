import { z } from "zod";

const trimmedString = z.string().trim();

const MAX_AMOUNT = 99_999_999_999.99;
const MAX_IMAGE_LENGTH = 5_000_000;

const amount = (label: string) =>
  z
    .number()
    .positive(`${label} must be a positive amount`)
    .max(MAX_AMOUNT, `${label} must be at most 11 integer digits`)
    .multipleOf(0.0001, `${label} must have at most 4 decimal places`);

const dateString = z.iso.date("Invalid date");
const imageString = trimmedString.max(MAX_IMAGE_LENGTH, "Image is too large");

export const adjustmentTypes = ["INCREASE", "DECREASE"] as const;
export type AdjustmentType = (typeof adjustmentTypes)[number];

export const CASH = "CASH";

const transferParty = z.union([z.literal(CASH), z.string().min(1)]);

export const adjustCashSchema = z.object({
  date: dateString,
  type: z.enum(adjustmentTypes),
  amount: amount("Amount"),
  description: trimmedString.max(500, "Description too long").optional(),
});

export const adjustBankSchema = z.object({
  date: dateString,
  type: z.enum(adjustmentTypes),
  amount: amount("Amount"),
  description: trimmedString.max(500, "Description too long").optional(),
  image: imageString.optional(),
});

export const createTransferSchema = z
  .object({
    date: dateString,
    amount: amount("Amount"),
    from: transferParty,
    to: transferParty,
    description: trimmedString.max(500, "Description too long").optional(),
    image: imageString.optional(),
  })
  .superRefine((value, ctx) => {
    if (value.from === CASH && value.to === CASH) {
      ctx.addIssue({
        code: "custom",
        path: ["to"],
        message: "A transfer must involve a bank account on one side",
      });
    }
    if (value.from === value.to) {
      ctx.addIssue({
        code: "custom",
        path: ["to"],
        message: "From and to bank accounts must be different",
      });
    }
  });

export const adjustmentResponseSchema = z.object({
  id: z.string(),
  companyId: z.string(),
  type: z.enum(adjustmentTypes),
  amount: z.number(),
  date: z.string(),
  description: z.string().nullable(),
  image: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const bankAdjustmentResponseSchema = adjustmentResponseSchema.extend({
  bankId: z.string(),
});

export const transferResponseSchema = z.object({
  id: z.string(),
  companyId: z.string(),
  fromBankId: z.string().nullable(),
  toBankId: z.string().nullable(),
  date: z.string(),
  amount: z.number(),
  description: z.string().nullable(),
  image: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// Schema for sale payment as shown in money/bank transaction history
export const moneySalePaymentResponseSchema = z.object({
  id: z.string(),
  saleId: z.string(),
  partyName: z.string(),
  date: z.string(),
  amount: z.number(),
  description: z.string().nullable(),
});

export const cashSummaryResponseSchema = z.object({
  balance: z.number(),
  adjustments: z.array(adjustmentResponseSchema),
  transfers: z.array(transferResponseSchema),
  salePayments: z.array(moneySalePaymentResponseSchema),
});

export const bankHistoryResponseSchema = z.object({
  balance: z.number(),
  adjustments: z.array(bankAdjustmentResponseSchema),
  transfers: z.array(transferResponseSchema),
  salePayments: z.array(moneySalePaymentResponseSchema),
});

export type AdjustmentDto = z.infer<typeof adjustmentResponseSchema>;
export type BankAdjustmentDto = z.infer<typeof bankAdjustmentResponseSchema>;
export type TransferDto = z.infer<typeof transferResponseSchema>;
export type MoneySalePaymentDto = z.infer<typeof moneySalePaymentResponseSchema>;
export type CashSummaryDto = z.infer<typeof cashSummaryResponseSchema>;
export type BankHistoryDto = z.infer<typeof bankHistoryResponseSchema>;
export type AdjustCashDto = z.infer<typeof adjustCashSchema>;
export type AdjustBankDto = z.infer<typeof adjustBankSchema>;
export type CreateTransferDto = z.infer<typeof createTransferSchema>;