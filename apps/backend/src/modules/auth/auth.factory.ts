import type { RequestHandler } from "express";
import {
  createAuthenticationMiddleware,
  DomainEventBus,
  NoopTransactionManager,
} from "backend-p";
import { env } from "../../config/env";
import { getPrismaClient } from "../../database/prisma.client";
import { JoseTokenSigner } from "./jose-token-signer";
import { JoseTokenVerifier } from "./jose-token-verifier";
import { UserRepository } from "./user.repository";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import logger from "../../utils/logger";

export class AuthModuleFactory {
  private static controller: AuthController | null = null;
  private static authMiddleware: RequestHandler | null = null;
  private static hasRegisteredObservers = false;

  static createController(): AuthController {
    if (AuthModuleFactory.controller === null) {
      AuthModuleFactory.controller = AuthModuleFactory.build();
    }
    return AuthModuleFactory.controller!;
  }

  static createAuthMiddleware(): RequestHandler {
    if (AuthModuleFactory.authMiddleware === null) {
      AuthModuleFactory.authMiddleware = createAuthenticationMiddleware(
        new JoseTokenVerifier(env.JWT_SECRET),
      );
    }
    return AuthModuleFactory.authMiddleware!;
  }

  private static build(): AuthController {
    const eventBus = DomainEventBus.getInstance();
    const prisma = getPrismaClient();
    const transactionManager = new NoopTransactionManager();
    const userRepository = new UserRepository(prisma);
    const tokenSigner = new JoseTokenSigner(env.JWT_SECRET, env.JWT_EXPIRES_IN);
    const service = new AuthService(
      userRepository,
      tokenSigner,
      transactionManager,
      eventBus,
      logger,
    );

    AuthModuleFactory.registerObservers(eventBus);

    return new AuthController(service);
  }

  private static registerObservers(eventBus: DomainEventBus): void {
    if (AuthModuleFactory.hasRegisteredObservers) {
      return;
    }

    eventBus.subscribe("auth.user.registered", (event) => {
      logger.info(
        { eventName: event.name, payload: event.payload },
        "User registered",
      );
    });

    eventBus.subscribe("auth.user.logged_in", (event) => {
      logger.info(
        { eventName: event.name, payload: event.payload },
        "User logged in",
      );
    });

    AuthModuleFactory.hasRegisteredObservers = true;
  }
}
