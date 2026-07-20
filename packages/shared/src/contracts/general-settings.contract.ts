import { z } from "zod";

export const currencies = [
  { code: "INR", symbol: "\u20B9", name: "Indian Rupee" },
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "\u20AC", name: "Euro" },
  { code: "GBP", symbol: "\u00A3", name: "British Pound" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "JPY", symbol: "\u00A5", name: "Japanese Yen" },
  { code: "CNY", symbol: "\u00A5", name: "Chinese Yuan" },
  { code: "SGD", symbol: "S$", name: "Singapore Dollar" },
  { code: "AED", symbol: "\u062F.\u0625", name: "UAE Dirham" },
  { code: "CHF", symbol: "CHF", name: "Swiss Franc" },
  { code: "SAR", symbol: "\uFDFC", name: "Saudi Riyal" },
  { code: "MYR", symbol: "RM", name: "Malaysian Ringgit" },
  { code: "THB", symbol: "\u0E3F", name: "Thai Baht" },
  { code: "NZD", symbol: "NZ$", name: "New Zealand Dollar" },
  { code: "ZAR", symbol: "R", name: "South African Rand" },
  { code: "HKD", symbol: "HK$", name: "Hong Kong Dollar" },
  { code: "KRW", symbol: "\u20A9", name: "South Korean Won" },
  { code: "SEK", symbol: "kr", name: "Swedish Krona" },
  { code: "NOK", symbol: "kr", name: "Norwegian Krone" },
] as const;

export type CurrencyInfo = (typeof currencies)[number];

export const currencyMap: Record<string, (typeof currencies)[number]> = Object.fromEntries(
  currencies.map((c) => [c.code, c]),
);

export const currencyCodes: readonly string[] = currencies.map((c) => c.code);

export const currencySymbols: Record<string, string> = Object.fromEntries(
  currencies.map((c) => [c.code, c.symbol]),
);

export function getCurrencySymbol(code: string): string {
  return currencySymbols[code] ?? code;
}

export function getCurrencyInfo(code: string): CurrencyInfo | undefined {
  return currencyMap[code];
}

export const dateFormats = [
  "DD/MM/YYYY",
  "MM/DD/YYYY",
  "YYYY-MM-DD",
  "DD-MM-YYYY",
  "YYYY/MM/DD",
  "DD.MM.YYYY",
] as const;

export type DateFormat = (typeof dateFormats)[number];

export interface GeneralSettingsDto {
  readonly id: string;
  readonly companyId: string;
  readonly businessCurrency: string;
  readonly decimalPlaces: number;
  readonly dateFormat: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export const updateGeneralSettingsSchema = z.object({
  businessCurrency: z
    .string()
    .refine((v) => currencyCodes.includes(v), { message: "Invalid currency code" })
    .optional(),
  decimalPlaces: z
    .number()
    .int()
    .min(1, "Minimum 1 decimal place")
    .max(5, "Maximum 5 decimal places")
    .optional(),
  dateFormat: z
    .string()
    .refine((v) => (dateFormats as readonly string[]).includes(v), { message: "Invalid date format" })
    .optional(),
});

export type UpdateGeneralSettingsDto = z.infer<typeof updateGeneralSettingsSchema>;
