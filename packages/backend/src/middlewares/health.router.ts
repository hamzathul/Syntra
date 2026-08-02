import { Router } from "express";
import { V1Response } from "../responses/v1-response";

export interface HealthDependencies {
  readonly checkDatabase: () => Promise<void>;
}

export function createHealthRouter(deps: HealthDependencies): Router {
  const router = Router();
  const v1 = V1Response.getInstance();

  router.get("/health", async (request, response) => {
    try {
      await deps.checkDatabase();
      v1.success(response, {
        request,
        message: "Service healthy",
        data: { status: "ok" },
      });
    } catch {
      v1.error(response, {
        request,
        statusCode: 503,
        code: "HEALTH_CHECK_FAILED",
        message: "Service unhealthy",
      });
    }
  });

  return router;
}
