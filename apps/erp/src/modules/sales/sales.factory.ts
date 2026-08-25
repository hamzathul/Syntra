import type { Router } from "express";
import { getPrismaClient } from "../../database/prisma.client";
import logger from "../../utils/logger";
import { SaleRepository } from "./sale.repository";
import { SaleService } from "./sale.service";
import { SalesController } from "./sales.controller";
import { createSalesRouter } from "./sales.routes";

export class SalesModuleFactory {
  private static controller: SalesController | null = null;
  private static router: Router | null = null;

  static getController(): SalesController {
    if (SalesModuleFactory.controller === null) {
      const prisma = getPrismaClient();
      const saleRepo = new SaleRepository(prisma);
      const saleService = new SaleService(saleRepo, logger);

      SalesModuleFactory.controller = new SalesController(saleService);
    }
    return SalesModuleFactory.controller;
  }

  static getRouter(): Router {
    if (SalesModuleFactory.router === null) {
      const controller = SalesModuleFactory.getController();
      SalesModuleFactory.router = createSalesRouter(controller);
    }
    return SalesModuleFactory.router;
  }
}
