export interface CompanyProfileRecord {
  readonly id: string;
  readonly name: string;
  readonly gstin: string | null;
  readonly phone1: string | null;
  readonly phone2: string | null;
  readonly email: string | null;
  readonly address: string | null;
  readonly pincode: string | null;
  readonly description: string | null;
  readonly signature: string | null;
  readonly state: string | null;
  readonly businessType: string | null;
  readonly businessCategory: string | null;
  readonly logo: string | null;
  readonly showOnCard: unknown;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}
