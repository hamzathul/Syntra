import type { AuthenticatedUser } from "./auth-context";

export interface TokenVerifier {
  verify(token: string): Promise<AuthenticatedUser>;
}
