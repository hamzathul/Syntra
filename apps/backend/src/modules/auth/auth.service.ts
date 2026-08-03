import { randomUUID, createHash } from "node:crypto";
import { hash, compare } from "bcryptjs";
import {
  ConflictError,
  NotFoundError,
  UnauthorizedError,
  isPrismaUniqueViolation,
  type LoggerPort,
  type TokenSigner,
  type TransactionManager,
} from "backend-p";
import type {
  AuthSessionDto,
  AuthUserDto,
  LoginRequestDto,
  RegisterRequestDto,
} from "shared";
import type { IUserRepository } from "./user.repository.port";
import type { IRefreshTokenRepository } from "./refresh-token.repository.port";
import { toAuthUserDto } from "./user.mapper";
import { env } from "../../config/env";

const BCRYPT_SALT_ROUNDS = 12;

import type { AuthServicePort } from "./auth.service.port";

export class AuthService implements AuthServicePort {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly tokenSigner: TokenSigner,
    private readonly refreshTokenRepository: IRefreshTokenRepository,
    private readonly transactionManager: TransactionManager,
    private readonly logger: LoggerPort,
  ) {}

  async register(dto: RegisterRequestDto): Promise<AuthSessionDto> {
    const existing = await this.userRepository.findByEmail(dto.email);
    if (existing !== null) {
      throw new ConflictError("A user with this email already exists");
    }

    const passwordHash = await hash(dto.password, BCRYPT_SALT_ROUNDS);
    let user;
    try {
      user = await this.userRepository.create({
        name: dto.name,
        email: dto.email,
        passwordHash,
      });
    } catch (error) {
      if (isPrismaUniqueViolation(error)) {
        throw new ConflictError("A user with this email already exists");
      }
      throw error;
    }

    const authUser = toAuthUserDto(user);

    const token = await this.tokenSigner.sign(authUser);
    const { raw: refreshToken, hash: refreshHash } =
      await this.tokenSigner.generateRefreshToken();

    await this.refreshTokenRepository.create({
      tokenHash: refreshHash,
      userId: user.id,
      family: randomUUID(),
      expiresAt: new Date(Date.now() + env.REFRESH_TOKEN_EXPIRES_IN * 1000),
    });

    this.logger.info(
      {
        category: "audit",
        action: "user.registered",
        userId: user.id,
        email: user.email,
      },
      "User registered",
    );

    return {
      user: authUser,
      token,
      refreshToken,
      refreshExpiresIn: env.REFRESH_TOKEN_EXPIRES_IN,
    };
  }

  async login(dto: LoginRequestDto): Promise<AuthSessionDto> {
    const user = await this.userRepository.findByEmail(dto.email);

    if (user === null || !user.isActive) {
      this.logger.info(
        {
          category: "audit",
          action: "login.failed",
          reason: "user_not_found",
          email: dto.email,
        },
        "Login failed",
      );
      throw new UnauthorizedError("Invalid credentials");
    }

    const isPasswordValid = await compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      this.logger.info(
        {
          category: "audit",
          action: "login.failed",
          reason: "invalid_password",
          userId: user.id,
        },
        "Login failed",
      );
      throw new UnauthorizedError("Invalid credentials");
    }

    const authUser = toAuthUserDto(user);

    const token = await this.tokenSigner.sign(authUser);
    const { raw: refreshToken, hash: refreshHash } =
      await this.tokenSigner.generateRefreshToken();

    await this.refreshTokenRepository.create({
      tokenHash: refreshHash,
      userId: user.id,
      family: randomUUID(),
      expiresAt: new Date(Date.now() + env.REFRESH_TOKEN_EXPIRES_IN * 1000),
    });

    this.logger.info(
      {
        category: "audit",
        action: "login.success",
        userId: user.id,
        email: user.email,
      },
      "Login successful",
    );

    return {
      user: authUser,
      token,
      refreshToken,
      refreshExpiresIn: env.REFRESH_TOKEN_EXPIRES_IN,
    };
  }

  async refresh(dto: { refreshToken: string }): Promise<AuthSessionDto> {
    const hashInput = createHash("sha256")
      .update(dto.refreshToken)
      .digest("hex");
    const stored = await this.refreshTokenRepository.findByTokenHash(hashInput);

    if (stored === null) {
      throw new UnauthorizedError("Invalid refresh token");
    }

    if (stored.revokedAt !== null) {
      await this.refreshTokenRepository.revokeAllByFamily(stored.family);
      this.logger.info(
        {
          category: "audit",
          action: "token.reuse",
          family: stored.family,
          userId: stored.userId,
        },
        "Token reuse detected — revoked token presented",
      );
      throw new UnauthorizedError("Invalid refresh token");
    }

    if (stored.expiresAt < new Date()) {
      throw new UnauthorizedError("Invalid refresh token");
    }

    const wasRevoked = await this.refreshTokenRepository.revokeIfUnrevoked(
      stored.id,
    );

    if (!wasRevoked) {
      this.logger.info(
        {
          category: "audit",
          action: "token.reuse",
          family: stored.family,
          userId: stored.userId,
        },
        "Token reuse detected — concurrent rotation conflict",
      );
      throw new UnauthorizedError("Invalid refresh token");
    }

    const user = await this.userRepository.findById(stored.userId);
    if (user === null || !user.isActive) {
      throw new UnauthorizedError("User not found");
    }

    const authUser = toAuthUserDto(user);

    const token = await this.tokenSigner.sign(authUser);
    const { raw: newRefreshToken, hash: newHash } =
      await this.tokenSigner.generateRefreshToken();

    await this.refreshTokenRepository.create({
      tokenHash: newHash,
      userId: user.id,
      family: stored.family,
      expiresAt: new Date(Date.now() + env.REFRESH_TOKEN_EXPIRES_IN * 1000),
    });

    this.logger.info(
      {
        category: "audit",
        action: "token.refreshed",
        userId: user.id,
        family: stored.family,
      },
      "Token refreshed",
    );

    return {
      user: authUser,
      token,
      refreshToken: newRefreshToken,
      refreshExpiresIn: env.REFRESH_TOKEN_EXPIRES_IN,
    };
  }

  async logout(dto: { refreshToken: string }): Promise<void> {
    const hashInput = createHash("sha256")
      .update(dto.refreshToken)
      .digest("hex");
    const stored = await this.refreshTokenRepository.findByTokenHash(hashInput);
    if (stored !== null) {
      await this.refreshTokenRepository.revoke(stored.id);
      this.logger.info(
        { category: "audit", action: "user.logout", userId: stored.userId },
        "User logged out",
      );
    }
  }

  async changePassword(
    userId: string,
    dto: { currentPassword: string; newPassword: string },
  ): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (user === null || !user.isActive) {
      throw new NotFoundError("User");
    }

    const isValid = await compare(dto.currentPassword, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedError("Current password is incorrect");
    }

    const newHash = await hash(dto.newPassword, BCRYPT_SALT_ROUNDS);
    await this.userRepository.update(userId, { passwordHash: newHash });

    await this.refreshTokenRepository.revokeAllByUserId(userId);

    this.logger.info(
      { category: "audit", action: "password.changed", userId },
      "Password changed",
    );
  }

  async getMe(userId: string): Promise<AuthUserDto> {
    const user = await this.userRepository.findById(userId);

    if (user === null || !user.isActive) {
      throw new NotFoundError("User");
    }

    return toAuthUserDto(user);
  }
}
