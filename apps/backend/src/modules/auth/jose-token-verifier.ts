import { UnauthorizedError, type AuthenticatedUser, type TokenVerifier } from "backend-p";
import type { UserRoleDto } from "shared";

interface JwtClaims {
  id: string;
  name: string;
  email: string;
  role: UserRoleDto;
  [key: string]: unknown;
}

export class JoseTokenVerifier implements TokenVerifier {
  private readonly secretKey: Uint8Array;

  constructor(secret: string) {
    this.secretKey = new TextEncoder().encode(secret);
  }

  async verify(token: string): Promise<AuthenticatedUser> {
    try {
      const { jwtVerify } = await import("jose");
      const { payload } = await jwtVerify(token, this.secretKey);
      const claims = payload as unknown as JwtClaims;
      return {
        id: claims.id,
        name: claims.name,
        email: claims.email,
        role: claims.role,
      };
    } catch {
      throw new UnauthorizedError("Invalid or expired token");
    }
  }
}
