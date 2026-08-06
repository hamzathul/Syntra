import type { PartyRecord } from "./party.types";

export interface PartyRow {
  readonly id: string;
  readonly companyId: string;
  readonly name: string;
  readonly contactNumber: string | null;
  readonly openingBalanceAmount: number | null;
  readonly openingBalanceType: PartyRecord["openingBalanceType"];
  readonly openingBalanceDate: Date | null;
  readonly creditLimit: number | null;
  readonly billingAddress: string | null;
  readonly email: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export function toPartyRecord(row: PartyRow): PartyRecord {
  return {
    id: row.id,
    companyId: row.companyId,
    name: row.name,
    contactNumber: row.contactNumber,
    openingBalanceAmount: toNumber(row.openingBalanceAmount),
    openingBalanceType: row.openingBalanceType,
    openingBalanceDate: row.openingBalanceDate,
    creditLimit: toNumber(row.creditLimit),
    billingAddress: row.billingAddress,
    email: row.email,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function toNumber(value: number | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  return Number(value);
}