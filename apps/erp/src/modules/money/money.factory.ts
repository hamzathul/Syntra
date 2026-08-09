import type { Router } from "express";
import { getPrismaClient } from "../../database/prisma.client";
import logger from "../../utils/logger";
import { MoneyRepository } from "./money.repository";
import { MoneyService } from "./money.service";
import { MoneyController } from "./money.controller";
import { createMoneyRouter } from "./money.routes";

export class MoneyModuleFactory {
  private static controller: MoneyController | null = null;
  private static router: Router | null = null;

  static getController(): MoneyController {
    if (MoneyModuleFactory.controller === null) {
      const prisma = getPrismaClient();
      const moneyRepo = new MoneyRepository(prisma);
      const moneyService = new MoneyService(moneyRepo, logger);

      MoneyModuleFactory.controller = new MoneyController(moneyService);
    }
    return MoneyModuleFactory.controller;
  }

  static getRouter(): Router {
    if (MoneyModuleFactory.router === null) {
      const controller = MoneyModuleFactory.getController();
      MoneyModuleFactory.router = createMoneyRouter(controller);
    }
    return MoneyModuleFactory.router;
  }
}