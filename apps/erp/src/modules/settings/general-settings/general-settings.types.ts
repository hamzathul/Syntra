export interface GeneralSettingsRecord {
  readonly id: string;
  readonly companyId: string;
  readonly businessCurrency: string;
  readonly decimalPlaces: number;
  readonly dateFormat: string;
  readonly stateOfSupplyEnabled: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}
