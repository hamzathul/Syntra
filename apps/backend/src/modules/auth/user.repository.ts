import type { PrismaClient } from "@prisma/client";
import { PrismaCrudRepository } from "../../infrastructure/prisma/prisma-crud.repository";
import type { IUserRepository } from "./user.repository.port";
import type {
  UserRecord,
  CreateUserInput,
  UpdateUserInput,
  UserFilter,
} from "./user.types";

export class UserRepository
  extends PrismaCrudRepository<UserRecord, CreateUserInput, UpdateUserInput, UserFilter>
  implements IUserRepository
{
  constructor(private readonly prisma: PrismaClient) {
    super(prisma.user);
  }

  findByEmail(email: string): Promise<UserRecord | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }
}
