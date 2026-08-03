import type { TaxGroupDto, CreateTaxGroupDto, UpdateTaxGroupDto } from "shared";

export interface ITaxGroupService {
  list(companyId: string): Promise<TaxGroupDto[]>;
  create(companyId: string, dto: CreateTaxGroupDto): Promise<TaxGroupDto>;
  update(
    id: string,
    companyId: string,
    dto: UpdateTaxGroupDto,
  ): Promise<TaxGroupDto>;
  remove(id: string, companyId: string): Promise<void>;
}
