import { randomUUID, createHash } from "node:crypto";
import type { TokenSigner } from "backend-p";
import type { AuthTokenDto, AuthUserDto } from "shared";

export class JoseTokenSigner implements TokenSigner {
  private readonly secretKey: Uint8Array;

  constructor(
    secret: string,
    private readonly expiresIn: number = 900,
  ) {
    this.secretKey = new TextEncoder().encode(secret);
  }

  async sign(user: AuthUserDto): Promise<AuthTokenDto> {
    const { SignJWT } = await import("jose");

    const jti = randomUUID();

    const accessToken = await new SignJWT({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setIssuer("syntra-core")
      .setAudience("syntra-services")
      .setJti(jti)
      .setExpirationTime(`${this.expiresIn}s`)
      .sign(this.secretKey);

    return {
      accessToken,
      tokenType: "Bearer",
      expiresIn: this.expiresIn,
    };
  }

  async generateRefreshToken(): Promise<{ raw: string; hash: string }> {
    const raw = randomUUID() + randomUUID();
    const hash = createHash("sha256").update(raw).digest("hex");
    return { raw, hash };
  }
}
