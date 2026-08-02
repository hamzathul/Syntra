import type { AuthUserDto } from "shared";
import type { UserRecord } from "./user.types";

export function toAuthUserDto(user: UserRecord): AuthUserDto {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}
