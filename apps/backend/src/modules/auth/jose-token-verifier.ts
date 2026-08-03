import {
  UnauthorizedError,
  type AuthenticatedUser,
  type TokenVerifier,
} from "backend-p";
import { authUserSchema } from "shared";

const TOKEN_ISSUER = "syntra-core";
const TOKEN_AUDIENCE = "syntra-services";

export class JoseTokenVerifier implements TokenVerifier {
  private readonly secretKey: Uint8Array;

  constructor(secret: string) {
    this.secretKey = new TextEncoder().encode(secret);
  }

  async verify(token: string): Promise<AuthenticatedUser> {
    try {
      const { jwtVerify } = await import("jose");
      const { payload } = await jwtVerify(token, this.secretKey, {
        issuer: TOKEN_ISSUER,
        audience: TOKEN_AUDIENCE,
      });

      const result = authUserSchema.safeParse(payload);
      if (!result.success) {
        throw new UnauthorizedError("Invalid or expired token");
      }

      return result.data;
    } catch {
      throw new UnauthorizedError("Invalid or expired token");
    }
  }
}
