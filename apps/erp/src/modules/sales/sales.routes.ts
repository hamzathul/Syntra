import { Router } from "express";
import { validateRequest } from "backend-p";
import { z } from "zod";
import {
  createSaleSchema,
  listSalesQuerySchema,
  updateSaleSchema,
} from "shared";
import type { SalesController } from "./sales.controller";

const paramsWithId = z.object({ id: z.string().min(1) });

export function createSalesRouter(controller: SalesController): Router {
  const router = Router();

  router.get(
    "/",
    validateRequest({ query: listSalesQuerySchema }),
    controller.listSales,
  );
  router.post(
    "/",
    validateRequest({ body: createSaleSchema }),
    controller.createSale,
  );

  router.get("/:id", validateRequest({ params: paramsWithId }), controller.getSale);
  router.patch(
    "/:id",
    validateRequest({ params: paramsWithId, body: updateSaleSchema }),
    controller.updateSale,
  );
  router.delete(
    "/:id",
    validateRequest({ params: paramsWithId }),
    controller.deleteSale,
  );

  return router;
}
