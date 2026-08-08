import type { BankRecord } from "./bank.types";

export interface BankRow {
  readonly id: string;
  readonly companyId: string;
  readonly name: string;
  readonly openingBalance: number;
  readonly openingBalanceDate: Date | null;
  readonly printBankDetails: boolean;
  readonly accountHolderName: string | null;
  readonly accountNumber: string | null;
  readonly ifscCode: string | null;
  readonly branchName: string | null;
  readonly printUpiQr: boolean;
  readonly upiId: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export function toBankRecord(row: BankRow): BankRecord {
  return {
    id: row.id,
    companyId: row.companyId,
    name: row.name,
    openingBalance: row.openingBalance === null ? null : Number(row.openingBalance),
    openingBalanceDate: row.openingBalanceDate,
    printBankDetails: row.printBankDetails,
    accountHolderName: row.accountHolderName,
    accountNumber: row.accountNumber,
    ifscCode: row.ifscCode,
    branchName: row.branchName,
    printUpiQr: row.printUpiQr,
    upiId: row.upiId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}