export interface BankRecord {
  readonly id: string;
  readonly companyId: string;
  readonly name: string;
  readonly openingBalance: number | null;
  readonly currentBalance: number;
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

export interface BankCreateData {
  readonly name: string;
  readonly openingBalance?: number | null;
  readonly openingBalanceDate?: Date | null;
  readonly printBankDetails?: boolean;
  readonly accountHolderName?: string | null;
  readonly accountNumber?: string | null;
  readonly ifscCode?: string | null;
  readonly branchName?: string | null;
  readonly printUpiQr?: boolean;
  readonly upiId?: string | null;
}

export type BankUpdateData = Partial<Omit<BankCreateData, "companyId">> & {
  readonly currentBalance?: number;
};