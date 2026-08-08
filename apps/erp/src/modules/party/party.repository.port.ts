import type { CursorPaginationResult } from "backend-p";
import type { PartyCreateData, PartyRecord, PartyUpdateData } from "./party.types";

export interface PartyListOptions {
  readonly limit?: number;
  readonly cursor?: string;
}

export interface IPartyRepository {
  findAll(
    companyId: string,
    options?: PartyListOptions,
  ): Promise<CursorPaginationResult<PartyRecord>>;
  findById(id: string, companyId: string): Promise<PartyRecord | null>;
  create(companyId: string, data: PartyCreateData): Promise<PartyRecord>;
  update(id: string, companyId: string, data: PartyUpdateData): Promise<PartyRecord>;
  delete(id: string, companyId: string): Promise<void>;
  existsName(name: string, companyId: string, excludeId?: string): Promise<boolean>;
}