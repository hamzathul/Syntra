import type { ListOptions } from "backend-p";
import type { CursorPaginationResult } from "backend-p";
import type {
  UserRecord,
  CreateUserInput,
  UpdateUserInput,
  UserFilter,
} from "./user.types";

export interface IUserRepository {
  findById(id: string): Promise<UserRecord | null>;
  findAll(
    options?: ListOptions<UserFilter>,
  ): Promise<CursorPaginationResult<UserRecord>>;
  create(data: CreateUserInput): Promise<UserRecord>;
  update(id: string, data: UpdateUserInput): Promise<UserRecord>;
  delete(id: string): Promise<void>;
  exists(id: string): Promise<boolean>;
  findByEmail(email: string): Promise<UserRecord | null>;
}
