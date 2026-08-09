import type { BankDto } from "shared";
import type { BankRecord } from "./bank.types";

export function toBankDto(record: BankRecord): BankDto {
  return {
    id: record.id,
    companyId: record.companyId,
    name: record.name,
    openingBalance: record.openingBalance,
    currentBalance: record.currentBalance,
    openingBalanceDate: record.openingBalanceDate
      ? record.openingBalanceDate.toISOString()
      : null,
    printBankDetails: record.printBankDetails,
    accountHolderName: record.accountHolderName,
    accountNumber: record.accountNumber,
    ifscCode: record.ifscCode,
    branchName: record.branchName,
    printUpiQr: record.printUpiQr,
    upiId: record.upiId,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}