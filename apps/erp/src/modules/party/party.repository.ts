import { NotFoundError, paginateResult } from "backend-p";
import type { DbClient } from "../../database/db-client";
import type {
  IPartyRepository,
  PartyListOptions,
} from "./party.repository.port";
import type {
  PartyCreateData,
  PartyRecord,
  PartyUpdateData,
} from "./party.types";
import { toPartyRecord, type PartyRow } from "./party.record";

const DEFAULT_LIST_LIMIT = 25;
const MAX_LIST_LIMIT = 100;

export class PartyRepository implements IPartyRepository {
  constructor(private readonly db: DbClient) {}

  async findAll(companyId: string, options?: PartyListOptions) {
    const limit = Math.min(options?.limit ?? DEFAULT_LIST_LIMIT, MAX_LIST_LIMIT);
    const rawParties = await this.db.party.findMany({
      where: { companyId },
      take: limit + 1,
      ...(options?.cursor ? { cursor: { id: options.cursor }, skip: 1 } : {}),
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    });
    return paginateResult(
      rawParties.map((party) =>
        toPartyRecord(party as unknown as PartyRow),
      ),
      limit,
      options?.cursor,
    );
  }

  async findById(id: string, companyId: string): Promise<PartyRecord | null> {
    const party = await this.db.party.findUnique({ where: { id } });
    if (!party || party.companyId !== companyId) return null;
    return toPartyRecord(party as unknown as PartyRow);
  }

  async create(companyId: string, data: PartyCreateData): Promise<PartyRecord> {
    const party = await this.db.party.create({
      data: { ...data, companyId },
    });
    return toPartyRecord(party as unknown as PartyRow);
  }

  async update(
    id: string,
    companyId: string,
    data: PartyUpdateData,
  ): Promise<PartyRecord> {
    const { count } = await this.db.party.updateMany({
      where: { id, companyId },
      data,
    });
    if (count === 0) throw new NotFoundError("Party");

    const party = await this.db.party.findUnique({ where: { id } });
    return toPartyRecord(party as unknown as PartyRow);
  }

  async delete(id: string, companyId: string): Promise<void> {
    const { count } = await this.db.party.deleteMany({
      where: { id, companyId },
    });
    if (count === 0) throw new NotFoundError("Party");
  }

  async existsName(
    name: string,
    companyId: string,
    excludeId?: string,
  ): Promise<boolean> {
    const count = await this.db.party.count({
      where: {
        companyId,
        name,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
    });
    return count > 0;
  }
}