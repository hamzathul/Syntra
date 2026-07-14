import { Router } from "express";
import { validateRequest } from "backend-p";
import { updateCompanyProfileSchema } from "shared";
import type { CompanyProfileController } from "./company-profile/company-profile.controller";

export function createSettingsRouter(companyProfileCtrl: CompanyProfileController): Router {
  const router = Router();

  router.get("/company-profile", companyProfileCtrl.get);
  router.patch(
    "/company-profile",
    validateRequest({ body: updateCompanyProfileSchema }),
    companyProfileCtrl.update,
  );

  return router;
}
