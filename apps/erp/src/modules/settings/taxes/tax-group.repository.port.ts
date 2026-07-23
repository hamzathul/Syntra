import type { TaxGroupRecord } from "./taxes.types";

export interface ITaxGroupRepository {
  findAll(companyId: string): Promise<TaxGroupRecord[]>;
  findById(id: string, companyId: string): Promise<TaxGroupRecord | null>;
  create(companyId: string, data: { name: string; taxRateIds: string[] }): Promise<TaxGroupRecord>;
  update(id: string, companyId: string, data: { name?: string; taxRateIds?: string[] }): Promise<TaxGroupRecord>;
  delete(id: string): Promise<void>;
}
