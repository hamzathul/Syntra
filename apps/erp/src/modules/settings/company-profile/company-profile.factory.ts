import { getPrismaClient } from "../../../database/prisma.client";
import logger from "../../../utils/logger";
import { CompanyProfileRepository } from "./company-profile.repository";
import { CompanyProfileService } from "./company-profile.service";
import { CompanyProfileController } from "./company-profile.controller";

export class CompanyProfileFactory {
  private static controller: CompanyProfileController | null = null;

  static getController(): CompanyProfileController {
    if (CompanyProfileFactory.controller === null) {
      const prisma = getPrismaClient();
      const repo = new CompanyProfileRepository(prisma);
      const service = new CompanyProfileService(repo, logger);
      CompanyProfileFactory.controller = new CompanyProfileController(service);
    }
    return CompanyProfileFactory.controller;
  }
}
