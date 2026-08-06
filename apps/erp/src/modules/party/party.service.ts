import {
  ConflictError,
  NotFoundError,
  isPrismaUniqueViolation,
  type LoggerPort,
} from "backend-p";
import type { CreatePartyDto, PartyDto, UpdatePartyDto } from "shared";
import type { IPartyRepository } from "./party.repository.port";
import type { IPartyService, PartyListParams } from "./party.service.port";
import type { PartyCreateData, PartyUpdateData } from "./party.types";
import { toPartyDto } from "./party.mapper";

const UPDATE_FIELDS = [
  "name",
  "contactNumber",
  "openingBalanceAmount",
  "openingBalanceType",
  "creditLimit",
  "billingAddress",
  "email",
] as const;

export class PartyService implements IPartyService {
  constructor(
    private readonly repo: IPartyRepository,
    private readonly logger: LoggerPort,
  ) {}

  async list(companyId: string, params?: PartyListParams) {
    const result = await this.repo.findAll(companyId, params);
    return {
      items: result.items.map(toPartyDto),
      meta: result.meta,
    };
  }

  async get(id: string, companyId: string): Promise<PartyDto> {
    const record = await this.repo.findById(id, companyId);
    if (!record) throw new NotFoundError("Party");
    return toPartyDto(record);
  }

  async create(companyId: string, dto: CreatePartyDto): Promise<PartyDto> {
    let record;
    try {
      record = await this.repo.create(companyId, this.toCreateData(dto));
    } catch (error) {
      if (isPrismaUniqueViolation(error)) {
        throw new ConflictError("A party with this name already exists");
      }
      throw error;
    }

    this.logger.info(
      {
        category: "audit",
        action: "party.created",
        companyId,
        partyId: record.id,
      },
      "Party created",
    );

    return toPartyDto(record);
  }

  async update(
    id: string,
    companyId: string,
    dto: UpdatePartyDto,
  ): Promise<PartyDto> {
    const existing = await this.repo.findById(id, companyId);
    if (!existing) throw new NotFoundError("Party");

    let record;
    try {
      record = await this.repo.update(id, companyId, this.toUpdateData(dto));
    } catch (error) {
      if (isPrismaUniqueViolation(error)) {
        throw new ConflictError("A party with this name already exists");
      }
      throw error;
    }

    this.logger.info(
      {
        category: "audit",
        action: "party.updated",
        companyId,
        partyId: id,
      },
      "Party updated",
    );

    return toPartyDto(record);
  }

  async remove(id: string, companyId: string): Promise<void> {
    const existing = await this.repo.findById(id, companyId);
    if (!existing) throw new NotFoundError("Party");

    await this.repo.delete(id, companyId);

    this.logger.info(
      {
        category: "audit",
        action: "party.deleted",
        companyId,
        partyId: id,
      },
      "Party deleted",
    );
  }

  private toCreateData(dto: CreatePartyDto): PartyCreateData {
    return {
      name: dto.name,
      contactNumber: dto.contactNumber,
      openingBalanceAmount: dto.openingBalanceAmount,
      openingBalanceType: dto.openingBalanceType,
      openingBalanceDate: dto.openingBalanceDate
        ? new Date(dto.openingBalanceDate)
        : null,
      creditLimit: dto.creditLimit,
      billingAddress: dto.billingAddress,
      email: dto.email,
    };
  }

  private toUpdateData(dto: UpdatePartyDto): PartyUpdateData {
    const data: Record<string, unknown> = {};
    for (const field of UPDATE_FIELDS) {
      if (dto[field] !== undefined) {
        data[field] = dto[field];
      }
    }
    if (dto.openingBalanceDate !== undefined) {
      data.openingBalanceDate = dto.openingBalanceDate
        ? new Date(dto.openingBalanceDate)
        : null;
    }
    return data as PartyUpdateData;
  }
}