import { z } from "zod";

const trimmedString = z.string().trim();

const MAX_AMOUNT = 99_999_999_999.99;
const MAX_IMAGE_LENGTH = 5_000_000;
const MAX_DOCUMENT_LENGTH = 5_000_000;

const amount = (label: string) =>
  z
    .number()
    .nonnegative(`${label} must be non-negative`)
    .max(MAX_AMOUNT, `${label} must be at most 11 integer digits`)
    .multipleOf(0.0001, `${label} must have at most 4 decimal places`);

const positiveAmount = (label: string) =>
  z
    .number()
    .positive(`${label} must be a positive amount`)
    .max(MAX_AMOUNT, `${label} must be at most 11 integer digits`)
    .multipleOf(0.0001, `${label} must have at most 4 decimal places`);

const dateString = z.iso.date("Invalid date");
const imageString = trimmedString.max(MAX_IMAGE_LENGTH, "Image is too large");
const documentString = trimmedString.max(
  MAX_DOCUMENT_LENGTH,
  "Document is too large",
);

export const saleTypes = ["CASH", "CREDIT"] as const;
export type SaleType = (typeof saleTypes)[number];

export const paymentModes = ["CASH", "CHEQUE", "BANK"] as const;
export type PaymentMode = (typeof paymentModes)[number];

export const chequeStatuses = [
  "RECEIVED",
  "DEPOSITED_BANK",
  "DEPOSITED_CASH",
  "BOUNCED",
] as const;
export type ChequeStatus = (typeof chequeStatuses)[number];

export const listSalesQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional(),
  cursor: z.string().min(1).optional(),
});

export const chequeSchema = z.object({
  drawBankName: trimmedString
    .min(1, "Bank name is required")
    .max(200, "Bank name too long"),
  chequeNumber: trimmedString
    .min(1, "Cheque number is required")
    .max(50, "Cheque number too long"),
  chequeDate: dateString,
  notes: trimmedString.max(2000, "Notes too long").optional(),
  image: imageString.optional(),
});

export const salePaymentSchema = z.object({
  mode: z.enum(paymentModes),
  amount: positiveAmount("Payment amount"),
  bankId: trimmedString.min(1).optional(),
  description: trimmedString.max(500, "Description too long").optional(),
  cheque: chequeSchema.optional(),
});

export const createSaleSchema = z
  .object({
    partyId: trimmedString.min(1, "Customer is required"),
    saleType: z.enum(saleTypes),
    saleDate: dateString.optional(),
    totalAmount: positiveAmount("Total amount"),
    receivedAmount: amount("Received amount").optional(),
    description: trimmedString.max(5000, "Description too long").optional(),
    image: imageString.optional(),
    document: documentString.optional(),
    payments: z.array(salePaymentSchema).default([]),
  })
  .superRefine((value, ctx) => {
    const received =
      value.saleType === "CASH"
        ? value.totalAmount
        : (value.receivedAmount ?? 0);

    if (received > value.totalAmount) {
      ctx.addIssue({
        code: "custom",
        path: ["receivedAmount"],
        message: "Received amount cannot exceed the total amount",
      });
    }

    const sum = value.payments.reduce((acc, payment) => acc + payment.amount, 0);
    if (Math.abs(sum - received) > 0.00001) {
      ctx.addIssue({
        code: "custom",
        path: ["payments"],
        message:
          "Payments must total exactly the received amount for this sale",
      });
    }

    value.payments.forEach((payment, index) => {
      const path = ["payments", index] as const;
      if (payment.mode === "BANK" && !payment.bankId) {
        ctx.addIssue({
          code: "custom",
          path: [...path, "bankId"],
          message: "Select a bank for bank payments",
        });
      }
      if (payment.mode === "CHEQUE" && !payment.cheque) {
        ctx.addIssue({
          code: "custom",
          path: [...path, "cheque"],
          message: "Cheque details are required for cheque payments",
        });
      }
      if (payment.mode === "CASH" && payment.bankId) {
        ctx.addIssue({
          code: "custom",
          path: [...path, "bankId"],
          message: "Cash payments cannot reference a bank",
        });
      }
      if (payment.mode !== "CHEQUE" && payment.cheque) {
        ctx.addIssue({
          code: "custom",
          path: [...path, "cheque"],
          message: "Cheque details are only allowed for cheque payments",
        });
      }
    });
  });

export const updateSaleSchema = z
  .object({
    partyId: trimmedString.min(1, "Customer is required").optional(),
    saleDate: dateString.optional(),
    totalAmount: positiveAmount("Total amount").optional(),
    receivedAmount: amount("Received amount").optional(),
    description: trimmedString.max(5000, "Description too long").nullable().optional(),
    image: imageString.nullable().optional(),
    document: documentString.nullable().optional(),
    payments: z.array(salePaymentSchema).optional(),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (
      value.receivedAmount !== undefined &&
      value.payments === undefined
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["receivedAmount"],
        message: "receivedAmount must be submitted together with payments",
      });
      return;
    }

    if (value.payments === undefined) return;

    const totalAmount = value.totalAmount;
    const receivedAmount = value.receivedAmount;
    const sum = value.payments.reduce((acc, payment) => acc + payment.amount, 0);

    if (receivedAmount === undefined) {
      ctx.addIssue({
        code: "custom",
        path: ["receivedAmount"],
        message: "receivedAmount must be submitted together with payments",
      });
    } else {
      if (totalAmount !== undefined && receivedAmount > totalAmount) {
        ctx.addIssue({
          code: "custom",
          path: ["receivedAmount"],
          message: "Received amount cannot exceed the total amount",
        });
      }
      if (Math.abs(sum - receivedAmount) > 0.00001) {
        ctx.addIssue({
          code: "custom",
          path: ["payments"],
          message:
            "Payments must total exactly the received amount for this sale",
        });
      }
    }

    value.payments.forEach((payment, index) => {
      const path = ["payments", index] as const;
      if (payment.mode === "BANK" && !payment.bankId) {
        ctx.addIssue({
          code: "custom",
          path: [...path, "bankId"],
          message: "Select a bank for bank payments",
        });
      }
      if (payment.mode === "CHEQUE" && !payment.cheque) {
        ctx.addIssue({
          code: "custom",
          path: [...path, "cheque"],
          message: "Cheque details are required for cheque payments",
        });
      }
      if (payment.mode === "CASH" && payment.bankId) {
        ctx.addIssue({
          code: "custom",
          path: [...path, "bankId"],
          message: "Cash payments cannot reference a bank",
        });
      }
      if (payment.mode !== "CHEQUE" && payment.cheque) {
        ctx.addIssue({
          code: "custom",
          path: [...path, "cheque"],
          message: "Cheque details are only allowed for cheque payments",
        });
      }
    });
  });

export const chequeResponseSchema = z.object({
  id: z.string(),
  salePaymentId: z.string(),
  saleId: z.string(),
  drawBankName: z.string(),
  chequeNumber: z.string(),
  chequeDate: z.string(),
  amount: z.number(),
  status: z.enum(chequeStatuses),
  depositBankId: z.string().nullable(),
  depositedAt: z.string().nullable(),
  notes: z.string().nullable(),
  image: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const salePaymentResponseSchema = z.object({
  id: z.string(),
  saleId: z.string(),
  mode: z.enum(paymentModes),
  amount: z.number(),
  bankId: z.string().nullable(),
  description: z.string().nullable(),
  cheque: chequeResponseSchema.nullable(),
  createdAt: z.string(),
});

export const saleResponseSchema = z.object({
  id: z.string(),
  companyId: z.string(),
  partyId: z.string(),
  partyName: z.string(),
  saleType: z.enum(saleTypes),
  saleDate: z.string(),
  totalAmount: z.number(),
  receivedAmount: z.number(),
  balanceDue: z.number(),
  paid: z.boolean(),
  description: z.string().nullable(),
  image: z.string().nullable(),
  document: z.string().nullable(),
  payments: z.array(salePaymentResponseSchema),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type ChequeDto = z.infer<typeof chequeResponseSchema>;
export type SalePaymentDto = z.infer<typeof salePaymentResponseSchema>;
export type SaleDto = z.infer<typeof saleResponseSchema>;
export type CreateSaleDto = z.infer<typeof createSaleSchema>;
export type UpdateSaleDto = z.infer<typeof updateSaleSchema>;
