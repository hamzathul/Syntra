import { getPrismaClient } from "../../../database/prisma.client";
import logger from "../../../utils/logger";
import { GeneralSettingsRepository } from "./general-settings.repository";
import { GeneralSettingsService } from "./general-settings.service";
import { GeneralSettingsController } from "./general-settings.controller";

export class GeneralSettingsFactory {
  private static controller: GeneralSettingsController | null = null;

  static getController(): GeneralSettingsController {
    if (GeneralSettingsFactory.controller === null) {
      const prisma = getPrismaClient();
      const repo = new GeneralSettingsRepository(prisma);
      const service = new GeneralSettingsService(repo, logger);
      GeneralSettingsFactory.controller = new GeneralSettingsController(
        service,
      );
    }
    return GeneralSettingsFactory.controller;
  }
}
