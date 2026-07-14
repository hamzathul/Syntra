import type { Router } from "express";
import { CompanyProfileFactory } from "./company-profile/company-profile.factory";
import { createSettingsRouter } from "./settings.routes";

export class SettingsModuleFactory {
  private static router: Router | null = null;

  static createRouter(): Router {
    if (SettingsModuleFactory.router === null) {
      const ctrl = CompanyProfileFactory.getController();
      SettingsModuleFactory.router = createSettingsRouter(ctrl);
    }
    return SettingsModuleFactory.router!;
  }
}
