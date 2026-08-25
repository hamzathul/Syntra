import type { CursorPaginationResult } from "backend-p";
import type {
  SaleCreateData,
  SaleRecord,
  SaleUpdateData,
} from "./sale.types";

export interface SaleListOptions {
  readonly limit?: number;
  readonly cursor?: string;
}

export interface ISaleRepository {
  findAll(
    companyId: string,
    options?: SaleListOptions,
  ): Promise<CursorPaginationResult<SaleRecord>>;
  findById(id: string, companyId: string): Promise<SaleRecord | null>;
  create(companyId: string, data: SaleCreateData): Promise<SaleRecord>;
  update(id: string, companyId: string, data: SaleUpdateData): Promise<SaleRecord>;
  delete(id: string, companyId: string): Promise<void>;
  partyExists(companyId: string, partyId: string): Promise<boolean>;
  banksExist(companyId: string, bankIds: string[]): Promise<boolean>;
}
