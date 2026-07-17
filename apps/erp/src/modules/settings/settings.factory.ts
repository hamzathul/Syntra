import type { Router } from "express";
import { CompanyProfileFactory } from "./company-profile/company-profile.factory";
import { GeneralSettingsFactory } from "./general-settings/general-settings.factory";
import { createSettingsRouter } from "./settings.routes";

export class SettingsModuleFactory {
  private static router: Router | null = null;

  static createRouter(): Router {
    if (SettingsModuleFactory.router === null) {
      const companyProfileCtrl = CompanyProfileFactory.getController();
      const generalSettingsCtrl = GeneralSettingsFactory.getController();
      SettingsModuleFactory.router = createSettingsRouter(companyProfileCtrl, generalSettingsCtrl);
    }
    return SettingsModuleFactory.router!;
  }
}
