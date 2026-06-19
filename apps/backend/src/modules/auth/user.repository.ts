import type { PrismaClient } from "@prisma/client";
import { BaseRepository } from "backend-p";

export interface UserRecord {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly passwordHash: string;
  readonly role: "USER" | "ADMIN";
  readonly isActive: boolean;
}

interface CreateUserInput {
  readonly name: string;
  readonly email: string;
  readonly passwordHash: string;
}

export class UserRepository extends BaseRepository<UserRecord, string> {
  constructor(private readonly prisma: PrismaClient) {
    super();
  }

  async findById(id: string): Promise<UserRecord | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async findByEmail(email: string): Promise<UserRecord | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async create(input: CreateUserInput): Promise<UserRecord> {
    return this.prisma.user.create({ data: input });
  }
}
