import type { Router } from "express";
import { getPrismaClient } from "../../database/prisma.client";
import logger from "../../utils/logger";
import { TaxRateRepository } from "../settings/taxes/tax-rate.repository";
import { TaxGroupRepository } from "../settings/taxes/tax-group.repository";
import { ItemRepository } from "./item.repository";
import { ItemService } from "./item.service";
import { UnitRepository } from "./unit.repository";
import { UnitService } from "./unit.service";
import { ItemCategoryRepository } from "./item-category.repository";
import { ItemCategoryService } from "./item-category.service";
import { ItemsController } from "./items.controller";
import { createItemsRouter } from "./items.routes";

export class ItemsModuleFactory {
  private static controller: ItemsController | null = null;
  private static router: Router | null = null;

  static getController(): ItemsController {
    if (ItemsModuleFactory.controller === null) {
      const prisma = getPrismaClient();
      const itemRepo = new ItemRepository(prisma);
      const unitRepo = new UnitRepository(prisma);
      const categoryRepo = new ItemCategoryRepository(prisma);
      const taxRateRepo = new TaxRateRepository(prisma);
      const taxGroupRepo = new TaxGroupRepository(prisma);

      const itemService = new ItemService(
        itemRepo,
        categoryRepo,
        unitRepo,
        taxRateRepo,
        taxGroupRepo,
        logger,
      );
      const unitService = new UnitService(unitRepo, logger);
      const categoryService = new ItemCategoryService(categoryRepo, logger);

      ItemsModuleFactory.controller = new ItemsController(
        itemService,
        unitService,
        categoryService,
      );
    }
    return ItemsModuleFactory.controller;
  }

  static getRouter(): Router {
    if (ItemsModuleFactory.router === null) {
      const controller = ItemsModuleFactory.getController();
      ItemsModuleFactory.router = createItemsRouter(controller);
    }
    return ItemsModuleFactory.router;
  }
}
