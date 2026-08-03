import type { Router } from "express";
import type { RequestHandler } from "express";
import { getPrismaClient } from "../../database/prisma.client";
import logger from "../../utils/logger";
import { CompanyRepository } from "./company.repository";
import { CompanyService } from "./company.service";
import { CompanyController } from "./company.controller";
import { createCompanyRouter } from "./company.routes";
import { createCompanyContextMiddleware } from "../../middlewares/company-context.middleware";
import { UnitRepository } from "../items/unit.repository";

export class CompanyModuleFactory {
  private static controller: CompanyController | null = null;
  private static companyContextMw: RequestHandler | null = null;

  private static getController(): CompanyController {
    if (CompanyModuleFactory.controller === null) {
      const prisma = getPrismaClient();
      const repo = new CompanyRepository(prisma);
      const unitRepo = new UnitRepository(prisma);
      const service = new CompanyService(repo, unitRepo, logger);
      CompanyModuleFactory.controller = new CompanyController(service);
      CompanyModuleFactory.companyContextMw = createCompanyContextMiddleware(
        repo,
        logger,
      );
    }
    return CompanyModuleFactory.controller;
  }

  static createRouter(): Router {
    return createCompanyRouter(CompanyModuleFactory.getController());
  }

  static createCompanyContextMiddleware(): RequestHandler {
    CompanyModuleFactory.getController();
    return CompanyModuleFactory.companyContextMw!;
  }
}
