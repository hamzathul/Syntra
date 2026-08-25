import type { CursorPaginationResult } from "backend-p";
import type { CreateSaleDto, SaleDto, UpdateSaleDto } from "shared";

export interface SaleListParams {
  readonly limit?: number;
  readonly cursor?: string;
}

export interface ISaleService {
  list(
    companyId: string,
    params?: SaleListParams,
  ): Promise<CursorPaginationResult<SaleDto>>;
  get(id: string, companyId: string): Promise<SaleDto>;
  create(companyId: string, dto: CreateSaleDto): Promise<SaleDto>;
  update(id: string, companyId: string, dto: UpdateSaleDto): Promise<SaleDto>;
  remove(id: string, companyId: string): Promise<void>;
}
