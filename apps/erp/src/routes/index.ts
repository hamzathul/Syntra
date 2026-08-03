import { Router } from "express";
import { createErpAuthMiddleware } from "../middlewares/erp-auth.middleware";
import v1Routes from "./v1";
import logger from "../utils/logger";

const router: Router = Router();

// Auth validation on every request
router.use(createErpAuthMiddleware(logger));

router.use("/v1", v1Routes);

export default router;
