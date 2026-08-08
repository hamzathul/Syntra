import { z } from "zod";
import type {
  CreatePartyDto,
  PartyDto,
  UpdatePartyDto,
} from "shared";

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

export const partyFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Party name is required")
    .max(200, "Party name too long"),
  contactNumber: z.string().max(50, "Contact number too long"),
  openingBalanceAmount: money("Opening balance"),
  openingBalanceType: z.enum(["", "TO_PAY", "TO_RECEIVE"]),
  openingBalanceDate: z.string(),
  creditLimit: money("Credit limit"),
  billingAddress: z.string().max(2000, "Billing address too long"),
  email: z
    .string()
    .max(200, "Email too long")
    .refine(
      (v) =>
        v.trim() === "" || z.string().email().safeParse(v).success,
      "Invalid email",
    ),
});

export type PartyFormValues = z.infer<typeof partyFormSchema>;

export function partyFormDefaultValues(): PartyFormValues {
  return {
    name: "",
    contactNumber: "",
    openingBalanceAmount: "",
    openingBalanceType: "",
    openingBalanceDate: "",
    creditLimit: "",
    billingAddress: "",
    email: "",
  };
}

export function partyFormValuesFromDto(party: PartyDto): PartyFormValues {
  const num = (v: number | null) => (v === null ? "" : String(v));
  return {
    name: party.name,
    contactNumber: party.contactNumber ?? "",
    openingBalanceAmount: num(party.openingBalanceAmount),
    openingBalanceType: party.openingBalanceType ?? "",
    openingBalanceDate: party.openingBalanceDate
      ? party.openingBalanceDate.slice(0, 10)
      : "",
    creditLimit: num(party.creditLimit),
    billingAddress: party.billingAddress ?? "",
    email: party.email ?? "",
  };
}

const optStr = (v: string) => (v.trim() === "" ? undefined : v.trim());
const optNum = (v: string) => (v.trim() === "" ? undefined : parseFloat(v));
const strOrNull = (v: string) => (v.trim() === "" ? null : v.trim());
const numOrNull = (v: string) => (v.trim() === "" ? null : parseFloat(v));
const dateOrNull = (v: string) => (v === "" ? null : v);

export function toCreatePartyPayload(values: PartyFormValues): CreatePartyDto {
  const payload: Record<string, unknown> = {
    name: values.name.trim(),
  };

  const optional: Array<[keyof CreatePartyDto, unknown]> = [
    ["contactNumber", optStr(values.contactNumber)],
    ["openingBalanceAmount", optNum(values.openingBalanceAmount)],
    ["openingBalanceType", values.openingBalanceType || undefined],
    ["openingBalanceDate", dateOrNull(values.openingBalanceDate) || undefined],
    ["creditLimit", optNum(values.creditLimit)],
    ["billingAddress", optStr(values.billingAddress)],
    ["email", optStr(values.email)],
  ];

  for (const [key, value] of optional) {
    if (value !== undefined) payload[key] = value;
  }

  return payload as CreatePartyDto;
}

export function toUpdatePartyPayload(values: PartyFormValues): UpdatePartyDto {
  const payload: Record<string, unknown> = {
    name: values.name.trim(),
  };

  const nullable: Array<[keyof UpdatePartyDto, unknown]> = [
    ["contactNumber", strOrNull(values.contactNumber)],
    ["openingBalanceAmount", numOrNull(values.openingBalanceAmount)],
    ["openingBalanceType", values.openingBalanceType || null],
    ["openingBalanceDate", dateOrNull(values.openingBalanceDate)],
    ["creditLimit", numOrNull(values.creditLimit)],
    ["billingAddress", strOrNull(values.billingAddress)],
    ["email", strOrNull(values.email)],
  ];

  for (const [key, value] of nullable) {
    payload[key] = value;
  }

  return payload as UpdatePartyDto;
}