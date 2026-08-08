import type { PartyDto } from "shared";
import type { PartyRecord } from "./party.types";

export function toPartyDto(record: PartyRecord): PartyDto {
  return {
    id: record.id,
    companyId: record.companyId,
    name: record.name,
    contactNumber: record.contactNumber,
    openingBalanceAmount: record.openingBalanceAmount,
    openingBalanceType: record.openingBalanceType,
    openingBalanceDate: record.openingBalanceDate
      ? record.openingBalanceDate.toISOString()
      : null,
    creditLimit: record.creditLimit,
    billingAddress: record.billingAddress,
    email: record.email,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}