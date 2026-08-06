import type { Router } from "express";
import { getPrismaClient } from "../../database/prisma.client";
import logger from "../../utils/logger";
import { PartyRepository } from "./party.repository";
import { PartyService } from "./party.service";
import { PartiesController } from "./parties.controller";
import { createPartiesRouter } from "./parties.routes";

export class PartyModuleFactory {
  private static controller: PartiesController | null = null;
  private static router: Router | null = null;

  static getController(): PartiesController {
    if (PartyModuleFactory.controller === null) {
      const prisma = getPrismaClient();
      const partyRepo = new PartyRepository(prisma);
      const partyService = new PartyService(partyRepo, logger);

      PartyModuleFactory.controller = new PartiesController(partyService);
    }
    return PartyModuleFactory.controller;
  }

  static getRouter(): Router {
    if (PartyModuleFactory.router === null) {
      const controller = PartyModuleFactory.getController();
      PartyModuleFactory.router = createPartiesRouter(controller);
    }
    return PartyModuleFactory.router;
  }
}