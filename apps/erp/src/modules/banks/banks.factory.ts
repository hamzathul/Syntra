import type { Router } from "express";
import { getPrismaClient } from "../../database/prisma.client";
import logger from "../../utils/logger";
import { BankRepository } from "./bank.repository";
import { BankService } from "./bank.service";
import { BanksController } from "./banks.controller";
import { createBanksRouter } from "./banks.routes";

export class BanksModuleFactory {
  private static controller: BanksController | null = null;
  private static router: Router | null = null;

  static getController(): BanksController {
    if (BanksModuleFactory.controller === null) {
      const prisma = getPrismaClient();
      const bankRepo = new BankRepository(prisma);
      const bankService = new BankService(bankRepo, logger);

      BanksModuleFactory.controller = new BanksController(bankService);
    }
    return BanksModuleFactory.controller;
  }

  static getRouter(): Router {
    if (BanksModuleFactory.router === null) {
      const controller = BanksModuleFactory.getController();
      BanksModuleFactory.router = createBanksRouter(controller);
    }
    return BanksModuleFactory.router;
  }
}