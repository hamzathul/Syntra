export interface RefreshTokenRecord {
  readonly id: string;
  readonly tokenHash: string;
  readonly userId: string;
  readonly family: string;
  readonly expiresAt: Date;
  readonly createdAt: Date;
  readonly revokedAt: Date | null;
}

export interface CreateRefreshTokenInput {
  tokenHash: string;
  userId: string;
  family: string;
  expiresAt: Date;
}

export interface IRefreshTokenRepository {
  create(data: CreateRefreshTokenInput): Promise<RefreshTokenRecord>;
  findByTokenHash(tokenHash: string): Promise<RefreshTokenRecord | null>;
  revoke(id: string): Promise<void>;
  revokeAllByUserId(userId: string): Promise<void>;
  revokeAllByFamily(family: string): Promise<void>;
}
