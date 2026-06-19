import type { AuthTokenDto, AuthUserDto } from "shared";

export interface TokenSigner {
  sign(user: AuthUserDto): Promise<AuthTokenDto>;
}
