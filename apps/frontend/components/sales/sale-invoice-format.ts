import { getCurrencySymbol } from "shared";
import type { BankDto } from "shared";

export function formatInvoiceAmount(
  value: number,
  currencyCode = "INR",
  decimalPlaces = 2,
): string {
  const symbol = getCurrencySymbol(currencyCode);
  const decimals = Math.min(Math.max(decimalPlaces, 0), 5);
  return `${symbol}${value.toLocaleString("en-IN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}

function pad2(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

/**
 * Format an ISO date string per the configured dateFormat.
 * Parses the YYYY-MM-DD calendar part directly to avoid timezone shifts.
 * Falls back to the raw YYYY-MM-DD slice when unparseable.
 */
export function formatInvoiceDate(
  isoDate: string,
  dateFormat = "DD/MM/YYYY",
): string {
  const part = isoDate.slice(0, 10);
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(part);
  if (!match) return part;
  const [, y, m, d] = match;
  switch (dateFormat) {
    case "MM/DD/YYYY":
      return `${m}/${d}/${y}`;
    case "YYYY-MM-DD":
      return `${y}-${m}-${d}`;
    case "DD-MM-YYYY":
      return `${d}-${m}-${y}`;
    case "YYYY/MM/DD":
      return `${y}/${m}/${d}`;
    case "DD.MM.YYYY":
      return `${d}.${m}.${y}`;
    case "DD/MM/YYYY":
    default:
      return `${d}/${m}/${y}`;
  }
}

/** Format a Date object with the same tokens (used for "Generated on" stamps). */
export function formatInvoiceDateTime(
  date: Date,
  dateFormat = "DD/MM/YYYY",
): string {
  const y = `${date.getFullYear()}`;
  const m = pad2(date.getMonth() + 1);
  const d = pad2(date.getDate());
  const iso = `${y}-${m}-${d}`;
  return formatInvoiceDate(iso, dateFormat);
}

export interface InvoiceBankGroups {
  readonly detailBanks: BankDto[];
  readonly upiBanks: BankDto[];
}

/**
 * Split banks per the banks page "Print On Invoice" toggles:
 * - detailBanks: printBankDetails=true AND accountNumber present
 * - upiBanks: printUpiQr=true AND upiId present (non-empty)
 */
export function groupInvoiceBanks(banks: BankDto[]): InvoiceBankGroups {
  return {
    detailBanks: banks.filter(
      (b) => b.printBankDetails && (b.accountNumber ?? "").trim() !== "",
    ),
    upiBanks: banks.filter(
      (b) => b.printUpiQr && (b.upiId ?? "").trim() !== "",
    ),
  };
}

export function buildUpiPayload(
  upiId: string,
  amount: number,
  payeeName: string,
  currencyCode = "INR",
): string {
  const params = new URLSearchParams({
    pa: upiId.trim(),
    pn: payeeName.trim() || "Merchant",
    am: amount.toFixed(2),
    cu: currencyCode,
  });
  return `upi://pay?${params.toString()}`;
}

/** Amount the QR should request: outstanding balance, falling back to total. */
export function invoiceQrAmount(total: number, balanceDue: number): number {
  return balanceDue > 0 ? balanceDue : total;
}

export function bankNameById(
  banks: BankDto[],
  bankId: string | null,
): string | null {
  if (!bankId) return null;
  return banks.find((b) => b.id === bankId)?.name ?? null;
}
