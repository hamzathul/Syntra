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
import type { UserRepository } from "./user.repository";

const BCRYPT_SALT_ROUNDS = 12;

export interface AuthServicePort {
  register(dto: RegisterRequestDto): Promise<AuthSessionDto>;
  login(dto: LoginRequestDto): Promise<AuthSessionDto>;
  getMe(userId: string): Promise<AuthUserDto>;
}

export class AuthService extends BaseService implements AuthServicePort {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly tokenSigner: TokenSigner,
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

        this.eventBus.publish({
          name: "auth.user.registered",
          occurredAt: new Date().toISOString(),
          payload: { userId: user.id, email: user.email },
        });

        return { user: authUser, token };
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

        this.eventBus.publish({
          name: "auth.user.logged_in",
          occurredAt: new Date().toISOString(),
          payload: { userId: user.id },
        });

        return { user: authUser, token };
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
