import type { TokenSigner } from "backend-p";
import type { AuthTokenDto, AuthUserDto } from "shared";

export class JoseTokenSigner implements TokenSigner {
  private readonly secretKey: Uint8Array;

  constructor(
    secret: string,
    private readonly expiresIn: number = 3600,
  ) {
    this.secretKey = new TextEncoder().encode(secret);
  }

  async sign(user: AuthUserDto): Promise<AuthTokenDto> {
    const { SignJWT } = await import("jose");

    const accessToken = await new SignJWT({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(`${this.expiresIn}s`)
      .sign(this.secretKey);

    return {
      accessToken,
      tokenType: "Bearer",
      expiresIn: this.expiresIn,
    };
  }
}
