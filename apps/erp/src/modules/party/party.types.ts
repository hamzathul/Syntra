import type { OpeningBalanceType } from "shared";

export interface PartyRecord {
  readonly id: string;
  readonly companyId: string;
  readonly name: string;
  readonly contactNumber: string | null;
  readonly openingBalanceAmount: number | null;
  readonly openingBalanceType: OpeningBalanceType | null;
  readonly openingBalanceDate: Date | null;
  readonly creditLimit: number | null;
  readonly billingAddress: string | null;
  readonly email: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface PartyCreateData {
  readonly name: string;
  readonly contactNumber?: string | null;
  readonly openingBalanceAmount?: number | null;
  readonly openingBalanceType?: OpeningBalanceType | null;
  readonly openingBalanceDate?: Date | null;
  readonly creditLimit?: number | null;
  readonly billingAddress?: string | null;
  readonly email?: string | null;
}

export type PartyUpdateData = Partial<Omit<PartyCreateData, "companyId">>;