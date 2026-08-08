import type { CursorPaginationResult } from "backend-p";
import type { CreatePartyDto, PartyDto, UpdatePartyDto } from "shared";

export interface PartyListParams {
  readonly limit?: number;
  readonly cursor?: string;
}

export interface IPartyService {
  list(
    companyId: string,
    params?: PartyListParams,
  ): Promise<CursorPaginationResult<PartyDto>>;
  get(id: string, companyId: string): Promise<PartyDto>;
  create(companyId: string, dto: CreatePartyDto): Promise<PartyDto>;
  update(id: string, companyId: string, dto: UpdatePartyDto): Promise<PartyDto>;
  remove(id: string, companyId: string): Promise<void>;
}