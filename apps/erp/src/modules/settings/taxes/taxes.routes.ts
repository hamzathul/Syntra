import { Router } from "express";
import { validateRequest } from "backend-p";
import { createTaxRateSchema, updateTaxRateSchema, createTaxGroupSchema, updateTaxGroupSchema } from "shared";
import type { TaxesController } from "./taxes.controller";

export function createTaxesRouter(controller: TaxesController): Router {
  const router = Router();

  router.get("/rates", controller.listRates);
  router.post("/rates", validateRequest({ body: createTaxRateSchema }), controller.createRate);
  router.patch("/rates/:id", validateRequest({ body: updateTaxRateSchema }), controller.updateRate);
  router.delete("/rates/:id", controller.deleteRate);

  router.get("/groups", controller.listGroups);
  router.post("/groups", validateRequest({ body: createTaxGroupSchema }), controller.createGroup);
  router.patch("/groups/:id", validateRequest({ body: updateTaxGroupSchema }), controller.updateGroup);
  router.delete("/groups/:id", controller.deleteGroup);

  return router;
}
