export interface TaxRateRecord {
  readonly id: string;
  readonly companyId: string;
  readonly name: string;
  readonly rate: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface TaxGroupRecord {
  readonly id: string;
  readonly companyId: string;
  readonly name: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly groupRates: Array<{
    taxRate: TaxRateRecord;
  }>;
}
