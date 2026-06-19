import { Router } from "express";
import { validateRequest } from "backend-p";
import { HealthModuleFactory } from "./health.factory";
import { healthCheckQuerySchema } from "./health.schema";

const router: Router = Router();
const healthController = HealthModuleFactory.createController();

router.get(
  "/",
  validateRequest({ query: healthCheckQuerySchema }),
  healthController.healthCheck,
);

export default router;
