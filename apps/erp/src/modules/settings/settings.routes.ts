import { Router } from "express";
import { validateRequest } from "backend-p";
import { updateCompanyProfileSchema, updateGeneralSettingsSchema } from "shared";
import type { CompanyProfileController } from "./company-profile/company-profile.controller";
import type { GeneralSettingsController } from "./general-settings/general-settings.controller";
import type { Router as TaxesRouter } from "express";

export function createSettingsRouter(
  companyProfileCtrl: CompanyProfileController,
  generalSettingsCtrl: GeneralSettingsController,
  taxesRouter: TaxesRouter,
): Router {
  const router = Router();

  router.get("/company-profile", companyProfileCtrl.get);
  router.patch(
    "/company-profile",
    validateRequest({ body: updateCompanyProfileSchema }),
    companyProfileCtrl.update,
  );

  router.get("/general", generalSettingsCtrl.get);
  router.patch(
    "/general",
    validateRequest({ body: updateGeneralSettingsSchema }),
    generalSettingsCtrl.update,
  );

  router.use("/taxes", taxesRouter);

  return router;
}
