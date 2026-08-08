import { z } from "zod";
import type { BankDto, CreateBankDto, UpdateBankDto } from "shared";

const money = (label: string) =>
  z
    .string()
    .refine(
      (v) => {
        if (v.trim() === "") return true;
        const [int = "", frac] = v.trim().split(".");
        if (int.length > 11) return false;
        if (frac !== undefined && frac.length > 4) return false;
        const n = Number(v);
        return Number.isFinite(n) && n >= 0;
      },
      `${label} must be a valid non-negative amount (max 11 integer digits, 4 decimal places)`,
    );

export const bankFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Bank name is required")
      .max(200, "Bank name too long"),
    openingBalance: money("Opening balance"),
    openingBalanceDate: z.string(),
    printBankDetails: z.boolean(),
    accountHolderName: z.string().max(200, "Account holder name too long"),
    accountNumber: z.string().max(50, "Account number too long"),
    ifscCode: z.string().max(20, "IFSC code too long"),
    branchName: z.string().max(200, "Branch name too long"),
    printUpiQr: z.boolean(),
    upiId: z.string().max(100, "UPI ID too long"),
  })
  .superRefine((value, ctx) => {
    if (value.printBankDetails && value.accountNumber.trim() === "") {
      ctx.addIssue({
        code: "custom",
        path: ["accountNumber"],
        message: "Account number is required when printing bank details",
      });
    }
  });

export type BankFormValues = z.infer<typeof bankFormSchema>;

export function bankFormDefaultValues(): BankFormValues {
  return {
    name: "",
    openingBalance: "",
    openingBalanceDate: "",
    printBankDetails: false,
    accountHolderName: "",
    accountNumber: "",
    ifscCode: "",
    branchName: "",
    printUpiQr: false,
    upiId: "",
  };
}

export function bankFormValuesFromDto(bank: BankDto): BankFormValues {
  const num = (v: number | null) => (v === null ? "" : String(v));
  return {
    name: bank.name,
    openingBalance: num(bank.openingBalance),
    openingBalanceDate: bank.openingBalanceDate
      ? bank.openingBalanceDate.slice(0, 10)
      : "",
    printBankDetails: bank.printBankDetails,
    accountHolderName: bank.accountHolderName ?? "",
    accountNumber: bank.accountNumber ?? "",
    ifscCode: bank.ifscCode ?? "",
    branchName: bank.branchName ?? "",
    printUpiQr: bank.printUpiQr,
    upiId: bank.upiId ?? "",
  };
}

const optStr = (v: string) => (v.trim() === "" ? undefined : v.trim());
const optNum = (v: string) => (v.trim() === "" ? undefined : parseFloat(v));
const strOrNull = (v: string) => (v.trim() === "" ? null : v.trim());
const numOrNull = (v: string) => (v.trim() === "" ? null : parseFloat(v));
const dateOrNull = (v: string) => (v === "" ? null : v);

export function toCreateBankPayload(values: BankFormValues): CreateBankDto {
  const payload: Record<string, unknown> = {
    name: values.name.trim(),
    printBankDetails: values.printBankDetails,
    printUpiQr: values.printUpiQr,
  };

  const optional: Array<[keyof CreateBankDto, unknown]> = [
    ["openingBalance", optNum(values.openingBalance)],
    ["openingBalanceDate", dateOrNull(values.openingBalanceDate) || undefined],
    ["accountHolderName", optStr(values.accountHolderName)],
    ["accountNumber", optStr(values.accountNumber)],
    ["ifscCode", optStr(values.ifscCode)],
    ["branchName", optStr(values.branchName)],
    ["upiId", optStr(values.upiId)],
  ];

  for (const [key, value] of optional) {
    if (value !== undefined) payload[key] = value;
  }

  return payload as CreateBankDto;
}

export function toUpdateBankPayload(values: BankFormValues): UpdateBankDto {
  const payload: Record<string, unknown> = {
    name: values.name.trim(),
    printBankDetails: values.printBankDetails,
    printUpiQr: values.printUpiQr,
  };

  const nullable: Array<[keyof UpdateBankDto, unknown]> = [
    ["openingBalance", numOrNull(values.openingBalance)],
    ["openingBalanceDate", dateOrNull(values.openingBalanceDate)],
    ["accountHolderName", strOrNull(values.accountHolderName)],
    ["accountNumber", strOrNull(values.accountNumber)],
    ["ifscCode", strOrNull(values.ifscCode)],
    ["branchName", strOrNull(values.branchName)],
    ["upiId", strOrNull(values.upiId)],
  ];

  for (const [key, value] of nullable) {
    payload[key] = value;
  }

  return payload as UpdateBankDto;
}