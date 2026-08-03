import type { TaxRateDto, CreateTaxRateDto, UpdateTaxRateDto } from "shared";

export interface ITaxRateService {
  list(companyId: string): Promise<TaxRateDto[]>;
  create(companyId: string, dto: CreateTaxRateDto): Promise<TaxRateDto>;
  update(
    id: string,
    companyId: string,
    dto: UpdateTaxRateDto,
  ): Promise<TaxRateDto>;
  remove(id: string, companyId: string): Promise<void>;
}
