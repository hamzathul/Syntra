import type { Router } from "express";
import { CompanyProfileFactory } from "./company-profile/company-profile.factory";
import { GeneralSettingsFactory } from "./general-settings/general-settings.factory";
import { TaxesModuleFactory } from "./taxes/taxes.factory";
import { createSettingsRouter } from "./settings.routes";

export class SettingsModuleFactory {
  private static router: Router | null = null;

  static createRouter(): Router {
    if (SettingsModuleFactory.router === null) {
      const companyProfileCtrl = CompanyProfileFactory.getController();
      const generalSettingsCtrl = GeneralSettingsFactory.getController();
      const taxesRouter = TaxesModuleFactory.getRouter();
      SettingsModuleFactory.router = createSettingsRouter(
        companyProfileCtrl,
        generalSettingsCtrl,
        taxesRouter,
      );
    }
    return SettingsModuleFactory.router!;
  }
}
