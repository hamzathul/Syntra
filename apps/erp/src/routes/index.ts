import { Router } from "express";
import { createErpAuthMiddleware } from "../middlewares/erp-auth.middleware";
import { CompanyModuleFactory } from "../modules/company/company.factory";
import { SettingsModuleFactory } from "../modules/settings/settings.factory";
import itemsRoutes from "../modules/items/items.routes";
import purchasesRoutes from "../modules/purchases/purchases.routes";
import salesRoutes from "../modules/sales/sales.routes";
import logger from "../utils/logger";

const router: Router = Router();

// Auth validation on every request
router.use(createErpAuthMiddleware(logger));

// Company management (no company context required — users may have none yet)
router.use("/v1/companies", CompanyModuleFactory.createRouter());

// Company context required for all ERP business routes
const companyCtx = CompanyModuleFactory.createCompanyContextMiddleware();
router.use("/v1/items", companyCtx, itemsRoutes);
router.use("/v1/sales", companyCtx, salesRoutes);
router.use("/v1/purchases", companyCtx, purchasesRoutes);
router.use("/v1/settings", companyCtx, SettingsModuleFactory.createRouter());

export default router;
