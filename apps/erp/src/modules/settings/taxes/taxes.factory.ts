import type { Router } from "express";
import { getPrismaClient } from "../../../database/prisma.client";
import logger from "../../../utils/logger";
import { TaxRateRepository } from "./tax-rate.repository";
import { TaxRateService } from "./tax-rate.service";
import { TaxGroupRepository } from "./tax-group.repository";
import { TaxGroupService } from "./tax-group.service";
import { TaxesController } from "./taxes.controller";
import { createTaxesRouter } from "./taxes.routes";

export class TaxesModuleFactory {
  private static controller: TaxesController | null = null;
  private static router: Router | null = null;

  static getController(): TaxesController {
    if (TaxesModuleFactory.controller === null) {
      const prisma = getPrismaClient();
      const taxRateRepo = new TaxRateRepository(prisma);
      const taxGroupRepo = new TaxGroupRepository(prisma);
      const taxRateService = new TaxRateService(taxRateRepo, logger);
      const taxGroupService = new TaxGroupService(taxGroupRepo, logger);
      TaxesModuleFactory.controller = new TaxesController(taxRateService, taxGroupService);
    }
    return TaxesModuleFactory.controller;
  }

  static getRouter(): Router {
    if (TaxesModuleFactory.router === null) {
      const controller = TaxesModuleFactory.getController();
      TaxesModuleFactory.router = createTaxesRouter(controller);
    }
    return TaxesModuleFactory.router;
  }
}
