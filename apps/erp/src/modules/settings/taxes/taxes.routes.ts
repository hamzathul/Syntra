import { Router } from "express";
import { validateRequest } from "backend-p";
import { z } from "zod";
import {
  createTaxRateSchema,
  updateTaxRateSchema,
  createTaxGroupSchema,
  updateTaxGroupSchema,
} from "shared";
import type { TaxesController } from "./taxes.controller";

const paramsWithId = z.object({ id: z.string().min(1) });

export function createTaxesRouter(controller: TaxesController): Router {
  const router = Router();

  router.get("/rates", controller.listRates);
  router.post(
    "/rates",
    validateRequest({ body: createTaxRateSchema }),
    controller.createRate,
  );
  router.patch(
    "/rates/:id",
    validateRequest({ params: paramsWithId, body: updateTaxRateSchema }),
    controller.updateRate,
  );
  router.delete(
    "/rates/:id",
    validateRequest({ params: paramsWithId }),
    controller.deleteRate,
  );

  router.get("/groups", controller.listGroups);
  router.post(
    "/groups",
    validateRequest({ body: createTaxGroupSchema }),
    controller.createGroup,
  );
  router.patch(
    "/groups/:id",
    validateRequest({ params: paramsWithId, body: updateTaxGroupSchema }),
    controller.updateGroup,
  );
  router.delete(
    "/groups/:id",
    validateRequest({ params: paramsWithId }),
    controller.deleteGroup,
  );

  return router;
}
