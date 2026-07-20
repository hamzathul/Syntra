export interface GeneralSettingsRecord {
  readonly id: string;
  readonly companyId: string;
  readonly businessCurrency: string;
  readonly decimalPlaces: number;
  readonly dateFormat: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}
