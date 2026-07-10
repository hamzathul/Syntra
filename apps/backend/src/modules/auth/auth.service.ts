import { randomUUID, createHash } from "node:crypto";
import { hash, compare } from "bcryptjs";
import {
  BaseService,
  ConflictError,
  NotFoundError,
  UnauthorizedError,
  withErrorLogging,
  type DomainEventBus,
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
import { env } from "../../config/env";

const BCRYPT_SALT_ROUNDS = 12;

export interface AuthServicePort {
  register(dto: RegisterRequestDto): Promise<AuthSessionDto>;
  login(dto: LoginRequestDto): Promise<AuthSessionDto>;
  getMe(userId: string): Promise<AuthUserDto>;
  refresh(dto: { refreshToken: string }): Promise<AuthSessionDto>;
  logout(dto: { refreshToken: string }): Promise<void>;
  changePassword(userId: string, dto: { currentPassword: string; newPassword: string }): Promise<void>;
}

export class AuthService extends BaseService implements AuthServicePort {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly tokenSigner: TokenSigner,
    private readonly refreshTokenRepository: IRefreshTokenRepository,
    private readonly transactionManager: TransactionManager,
    private readonly eventBus: DomainEventBus,
    private readonly logger: LoggerPort,
  ) {
    super("AuthService");
  }

  async register(dto: RegisterRequestDto): Promise<AuthSessionDto> {
    return withErrorLogging(
      `${this.name}.register`,
      this.logger,
      async () => {
        const existing = await this.userRepository.findByEmail(dto.email);
        if (existing !== null) {
          throw new ConflictError("A user with this email already exists");
        }

        const passwordHash = await hash(dto.password, BCRYPT_SALT_ROUNDS);
        const user = await this.userRepository.create({
          name: dto.name,
          email: dto.email,
          passwordHash,
        });

        const authUser: AuthUserDto = {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };

        const token = await this.tokenSigner.sign(authUser);
        const { raw: refreshToken, hash: refreshHash } =
          await this.tokenSigner.generateRefreshToken();

        await this.refreshTokenRepository.create({
          tokenHash: refreshHash,
          userId: user.id,
          family: randomUUID(),
          expiresAt: new Date(
            Date.now() + env.REFRESH_TOKEN_EXPIRES_IN * 1000,
          ),
        });

        this.eventBus.publish({
          name: "auth.user.registered",
          occurredAt: new Date().toISOString(),
          payload: { userId: user.id, email: user.email },
        });

        return {
          user: authUser,
          token,
          refreshToken,
          refreshExpiresIn: env.REFRESH_TOKEN_EXPIRES_IN,
        };
      },
    );
  }

  async login(dto: LoginRequestDto): Promise<AuthSessionDto> {
    return withErrorLogging(
      `${this.name}.login`,
      this.logger,
      async () => {
        const user = await this.userRepository.findByEmail(dto.email);

        if (user === null || !user.isActive) {
          throw new UnauthorizedError("Invalid credentials");
        }

        const isPasswordValid = await compare(dto.password, user.passwordHash);
        if (!isPasswordValid) {
          throw new UnauthorizedError("Invalid credentials");
        }

        const authUser: AuthUserDto = {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };

        const token = await this.tokenSigner.sign(authUser);
        const { raw: refreshToken, hash: refreshHash } =
          await this.tokenSigner.generateRefreshToken();

        await this.refreshTokenRepository.create({
          tokenHash: refreshHash,
          userId: user.id,
          family: randomUUID(),
          expiresAt: new Date(
            Date.now() + env.REFRESH_TOKEN_EXPIRES_IN * 1000,
          ),
        });

        this.eventBus.publish({
          name: "auth.user.logged_in",
          occurredAt: new Date().toISOString(),
          payload: { userId: user.id },
        });

        return {
          user: authUser,
          token,
          refreshToken,
          refreshExpiresIn: env.REFRESH_TOKEN_EXPIRES_IN,
        };
      },
    );
  }

  async refresh(dto: { refreshToken: string }): Promise<AuthSessionDto> {
    return withErrorLogging(
      `${this.name}.refresh`,
      this.logger,
      async () => {
        const hashInput = createHash("sha256")
          .update(dto.refreshToken)
          .digest("hex");
        const stored =
          await this.refreshTokenRepository.findByTokenHash(hashInput);

        if (stored === null) {
          throw new UnauthorizedError("Invalid refresh token");
        }

        if (stored.revokedAt !== null) {
          await this.refreshTokenRepository.revokeAllByFamily(stored.family);
          throw new UnauthorizedError("Invalid refresh token");
        }

        if (stored.expiresAt < new Date()) {
          throw new UnauthorizedError("Invalid refresh token");
        }

        await this.refreshTokenRepository.revoke(stored.id);

        const user = await this.userRepository.findById(stored.userId);
        if (user === null || !user.isActive) {
          throw new UnauthorizedError("User not found");
        }

        const authUser: AuthUserDto = {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };

        const token = await this.tokenSigner.sign(authUser);
        const {
          raw: newRefreshToken,
          hash: newHash,
        } = await this.tokenSigner.generateRefreshToken();

        await this.refreshTokenRepository.create({
          tokenHash: newHash,
          userId: user.id,
          family: stored.family,
          expiresAt: new Date(
            Date.now() + env.REFRESH_TOKEN_EXPIRES_IN * 1000,
          ),
        });

        return {
          user: authUser,
          token,
          refreshToken: newRefreshToken,
          refreshExpiresIn: env.REFRESH_TOKEN_EXPIRES_IN,
        };
      },
    );
  }

  async logout(dto: { refreshToken: string }): Promise<void> {
    return withErrorLogging(
      `${this.name}.logout`,
      this.logger,
      async () => {
        const hashInput = createHash("sha256")
          .update(dto.refreshToken)
          .digest("hex");
        const stored =
          await this.refreshTokenRepository.findByTokenHash(hashInput);
        if (stored !== null) {
          await this.refreshTokenRepository.revoke(stored.id);
        }
      },
    );
  }

  async changePassword(
    userId: string,
    dto: { currentPassword: string; newPassword: string },
  ): Promise<void> {
    return withErrorLogging(
      `${this.name}.changePassword`,
      this.logger,
      async () => {
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
      },
    );
  }

  async getMe(userId: string): Promise<AuthUserDto> {
    return withErrorLogging(
      `${this.name}.getMe`,
      this.logger,
      async () => {
        const user = await this.userRepository.findById(userId);

        if (user === null || !user.isActive) {
          throw new NotFoundError("User");
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    );
  }
}
