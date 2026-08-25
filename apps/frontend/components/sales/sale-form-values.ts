import { z } from "zod";
import type { CreateSaleDto, SaleDto, UpdateSaleDto } from "shared";

const money = (label: string) =>
  z
    .string()
    .refine(
      (v) => {
        if (v.trim() === "") return true;
        const n = Number(v);
        return Number.isFinite(n) && n >= 0 && n <= 999_999_999_999;
      },
      `${label} must be a valid non-negative amount`,
    );

const positiveMoney = (label: string) =>
  z
    .string()
    .refine(
      (v) => {
        const n = Number(v);
        return v.trim() !== "" && Number.isFinite(n) && n > 0;
      },
      `${label} must be a positive amount`,
    );

const chequeFieldsSchema = z.object({
  drawBankName: z.string(),
  chequeNumber: z.string(),
  chequeDate: z.string(),
  notes: z.string(),
  image: z.string().nullable(),
});

const paymentSchema = z.object({
  mode: z.enum(["CASH", "CHEQUE", "BANK"]),
  amount: money("Payment amount"),
  bankId: z.string(),
  description: z.string(),
  cheque: chequeFieldsSchema,
});

export const saleFormSchema = z
  .object({
    partyId: z.string(),
    saleType: z.enum(["CASH", "CREDIT"]),
    saleDate: z.string().min(1, "Sale date is required"),
    totalAmount: positiveMoney("Total amount"),
    receivedAmount: money("Received amount"),
    description: z.string().max(5000, "Description too long"),
    image: z.string().nullable(),
    document: z.string().nullable(),
    payments: z.array(paymentSchema),
  })
  .superRefine((values, ctx) => {
    if (values.partyId.trim() === "") {
      ctx.addIssue({
        code: "custom",
        path: ["partyId"],
        message: "Customer is required",
      });
    }

    const total = Number(values.totalAmount) || 0;
    const received =
      values.saleType === "CASH" ? total : (Number(values.receivedAmount) || 0);
    const sum = values.payments.reduce(
      (acc, payment) => acc + (Number(payment.amount) || 0),
      0,
    );

    if (values.saleType === "CREDIT" && received > total) {
      ctx.addIssue({
        code: "custom",
        path: ["receivedAmount"],
        message: "Received amount cannot exceed the total amount",
      });
    }

    if (Math.abs(sum - received) > 0.00001) {
      ctx.addIssue({
        code: "custom",
        path: ["payments"],
        message:
          values.saleType === "CASH"
            ? "Payments must total the full sale amount for cash sales"
            : "Payment entries must total exactly the received amount",
      });
    }

    values.payments.forEach((payment, index) => {
      if (payment.mode === "BANK" && payment.bankId.trim() === "") {
        ctx.addIssue({
          code: "custom",
          path: ["payments", index, "bankId"],
          message: "Select a bank",
        });
      }
      if (
        payment.mode === "CHEQUE" &&
        (!payment.cheque ||
          payment.cheque.drawBankName.trim() === "" ||
          payment.cheque.chequeNumber.trim() === "")
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["payments", index, "cheque"],
          message: "Cheque bank name and number are required",
        });
      }
    });
  });

export type SaleFormValues = z.infer<typeof saleFormSchema>;
export type SalePaymentFormValues = SaleFormValues["payments"][number];

export function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function emptySaleFormValues(): SaleFormValues {
  return {
    partyId: "",
    saleType: "CASH",
    saleDate: today(),
    totalAmount: "",
    receivedAmount: "",
    description: "",
    image: null,
    document: null,
    payments: [
      {
        mode: "CASH",
        amount: "",
        bankId: "",
        description: "",
        cheque: { drawBankName: "", chequeNumber: "", chequeDate: today(), notes: "", image: null },
      },
    ],
  };
}

export function saleFormValuesFromDto(sale: SaleDto): SaleFormValues {
  return {
    partyId: sale.partyId,
    saleType: sale.saleType,
    saleDate: sale.saleDate.slice(0, 10),
    totalAmount: String(sale.totalAmount),
    receivedAmount:
      sale.saleType === "CASH" ? "" : String(sale.receivedAmount),
    description: sale.description ?? "",
    image: sale.image,
    document: sale.document,
    payments: sale.payments.map((payment) => ({
      mode: payment.mode,
      amount: String(payment.amount),
      bankId: payment.bankId ?? "",
      description: payment.description ?? "",
      cheque: payment.cheque
        ? {
            drawBankName: payment.cheque.drawBankName,
            chequeNumber: payment.cheque.chequeNumber,
            chequeDate: payment.cheque.chequeDate.slice(0, 10),
            notes: payment.cheque.notes ?? "",
            image: payment.cheque.image,
          }
        : {
            drawBankName: "",
            chequeNumber: "",
            chequeDate: today(),
            notes: "",
            image: null,
          },
    })),
  };
}

function paymentPayload(
  payment: SalePaymentFormValues,
): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    mode: payment.mode,
    amount: Number(payment.amount),
  };
  if (payment.bankId.trim() !== "") payload.bankId = payment.bankId.trim();
  if (payment.description.trim() !== "") {
    payload.description = payment.description.trim();
  }
  if (payment.mode === "CHEQUE" && payment.cheque) {
    const cheque: Record<string, unknown> = {
      drawBankName: payment.cheque.drawBankName.trim(),
      chequeNumber: payment.cheque.chequeNumber.trim(),
      chequeDate: payment.cheque.chequeDate,
    };
    if (payment.cheque.notes.trim() !== "") {
      cheque.notes = payment.cheque.notes.trim();
    }
    if (payment.cheque.image) cheque.image = payment.cheque.image;
    payload.cheque = cheque;
  }
  return payload;
}

export function toCreateSalePayload(values: SaleFormValues): CreateSaleDto {
  const received =
    values.saleType === "CASH"
      ? Number(values.totalAmount)
      : (Number(values.receivedAmount) || 0);

  const payload: Record<string, unknown> = {
    partyId: values.partyId,
    saleType: values.saleType,
    saleDate: values.saleDate,
    totalAmount: Number(values.totalAmount),
    receivedAmount: received,
    payments: values.payments.map(paymentPayload),
  };

  if (values.description.trim() !== "") {
    payload.description = values.description.trim();
  }
  if (values.image) payload.image = values.image;
  if (values.document) payload.document = values.document;

  return payload as CreateSaleDto;
}

export function toUpdateSalePayload(values: SaleFormValues): UpdateSaleDto {
  const payload: Record<string, unknown> = {
    partyId: values.partyId,
    saleDate: values.saleDate,
    totalAmount: Number(values.totalAmount),
    payments: values.payments.map(paymentPayload),
  };

  if (values.saleType === "CREDIT") {
    payload.receivedAmount = Number(values.receivedAmount) || 0;
  }

  payload.description = values.description.trim() === "" ? null : values.description.trim();
  payload.image = values.image;
  payload.document = values.document;

  return payload as UpdateSaleDto;
}
