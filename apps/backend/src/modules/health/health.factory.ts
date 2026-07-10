import { getPrismaClient } from "../../database/prisma.client";
import { HealthController } from "./health.controller";
import { HealthRepository } from "./health.repository";
import { HealthService } from "./health.service";
import logger from "../../utils/logger";

export class HealthModuleFactory {
  private static controller: HealthController | null = null;

  static createController(): HealthController {
    if (HealthModuleFactory.controller === null) {
      const prisma = getPrismaClient();
      const repository = new HealthRepository(prisma);
      const service = new HealthService(repository, logger);

      HealthModuleFactory.controller = new HealthController(service);
    }

    return HealthModuleFactory.controller!;
  }
}
