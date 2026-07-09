import type { AuthTokenDto, AuthUserDto } from "shared";

export interface TokenSigner {
  sign(user: AuthUserDto): Promise<AuthTokenDto>;
  generateRefreshToken(): Promise<{ raw: string; hash: string }>;
}
