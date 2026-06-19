import { Router } from "express";
import itemsRoutes from "../modules/items/items.routes";
import purchasesRoutes from "../modules/purchases/purchases.routes";
import salesRoutes from "../modules/sales/sales.routes";
import settingsRoutes from "../modules/settings/settings.routes";

const router: Router = Router();

router.use("/v1/items", itemsRoutes);
router.use("/v1/sales", salesRoutes);
router.use("/v1/purchases", purchasesRoutes);
router.use("/v1/settings", settingsRoutes);

export default router;
