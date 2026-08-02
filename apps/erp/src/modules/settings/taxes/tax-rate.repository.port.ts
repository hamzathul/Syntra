import type { TaxRateRecord } from "./taxes.types";

export interface ITaxRateRepository {
  findAll(companyId: string): Promise<TaxRateRecord[]>;
  findById(id: string, companyId: string): Promise<TaxRateRecord | null>;
  create(
    companyId: string,
    data: { name: string; rate: number },
  ): Promise<TaxRateRecord>;
  update(
    id: string,
    data: { name?: string; rate?: number },
  ): Promise<TaxRateRecord>;
  delete(id: string): Promise<TaxRateRecord>;
  isUsedInAnyGroup(id: string, companyId: string): Promise<boolean>;
  countByIds(ids: string[], companyId: string): Promise<number>;
}
