import { Router } from "express";
import { CompanyModuleFactory } from "../../modules/company/company.factory";
import { SettingsModuleFactory } from "../../modules/settings/settings.factory";
import { ItemsModuleFactory } from "../../modules/items/items.factory";
import { PartyModuleFactory } from "../../modules/party/party.factory";
import { BanksModuleFactory } from "../../modules/banks/banks.factory";
import { MoneyModuleFactory } from "../../modules/money/money.factory";
import purchasesRoutes from "../../modules/purchases/purchases.routes";
import salesRoutes from "../../modules/sales/sales.routes";

const router: Router = Router();

// Company management (no company context required — users may have none yet)
router.use("/companies", CompanyModuleFactory.createRouter());

// Company context required for all ERP business routes
const companyCtx = CompanyModuleFactory.createCompanyContextMiddleware();
router.use("/items", companyCtx, ItemsModuleFactory.getRouter());
router.use("/parties", companyCtx, PartyModuleFactory.getRouter());
router.use("/banks", companyCtx, BanksModuleFactory.getRouter());
router.use("/money", companyCtx, MoneyModuleFactory.getRouter());
router.use("/sales", companyCtx, salesRoutes);
router.use("/purchases", companyCtx, purchasesRoutes);
router.use("/settings", companyCtx, SettingsModuleFactory.createRouter());

export default router;
