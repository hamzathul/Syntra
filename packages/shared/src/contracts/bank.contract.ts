import { z } from "zod";

const trimmedString = z.string().trim();

const MAX_AMOUNT = 99_999_999_999.99;

const amount = (label: string) =>
  z
    .number()
    .nonnegative(`${label} must be non-negative`)
    .max(MAX_AMOUNT, `${label} must be at most 11 integer digits`)
    .multipleOf(0.0001, `${label} must have at most 4 decimal places`);

const dateString = z.iso.date("Invalid date");

const bankFields = {
  openingBalance: amount("Opening balance").nullable().optional(),
  openingBalanceDate: dateString.nullable().optional(),
  printBankDetails: z.boolean().optional(),
  accountHolderName: trimmedString.max(200).nullable().optional(),
  accountNumber: trimmedString.max(50).nullable().optional(),
  ifscCode: trimmedString.max(20).nullable().optional(),
  branchName: trimmedString.max(200).nullable().optional(),
  printUpiQr: z.boolean().optional(),
  upiId: trimmedString.max(100).nullable().optional(),
};

export const createBankSchema = z
  .object({
    name: trimmedString.min(1, "Bank name is required").max(200),
    ...bankFields,
  })
  .superRefine((value, ctx) => {
    if (value.printBankDetails && !value.accountNumber) {
      ctx.addIssue({
        code: "custom",
        path: ["accountNumber"],
        message:
          "Account number is required when printing bank details on invoices",
      });
    }
  });

export const updateBankSchema = z
  .object({
    name: trimmedString.max(200).optional(),
    ...bankFields,
  })
  .superRefine((value, ctx) => {
    if (value.printBankDetails && !value.accountNumber) {
      ctx.addIssue({
        code: "custom",
        path: ["accountNumber"],
        message:
          "Account number is required when printing bank details on invoices",
      });
    }
  });

export const bankResponseSchema = z.object({
  id: z.string(),
  companyId: z.string(),
  name: z.string(),
  openingBalance: z.number().nullable(),
  openingBalanceDate: z.string().nullable(),
  printBankDetails: z.boolean(),
  accountHolderName: z.string().nullable(),
  accountNumber: z.string().nullable(),
  ifscCode: z.string().nullable(),
  branchName: z.string().nullable(),
  printUpiQr: z.boolean(),
  upiId: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type BankDto = z.infer<typeof bankResponseSchema>;
export type CreateBankDto = z.infer<typeof createBankSchema>;
export type UpdateBankDto = z.infer<typeof updateBankSchema>;