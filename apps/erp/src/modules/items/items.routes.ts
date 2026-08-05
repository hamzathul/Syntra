import { Router } from "express";
import { validateRequest } from "backend-p";
import { z } from "zod";
import {
  createItemSchema,
  updateItemSchema,
  createItemCategorySchema,
  updateItemCategorySchema,
  createUnitSchema,
  updateUnitSchema,
} from "shared";
import type { ItemsController } from "./items.controller";

const paramsWithId = z.object({ id: z.string().min(1) });

export function createItemsRouter(controller: ItemsController): Router {
  const router = Router();

  // Static routes must be registered before "/:id" so they are not captured
  router.get("/", controller.listItems);
  router.post("/", validateRequest({ body: createItemSchema }), controller.createItem);

  router.get("/next-code", controller.generateItemCode);
  router.get("/next-barcode", controller.generateItemBarcode);

  router.get("/categories", controller.listCategories);
  router.post(
    "/categories",
    validateRequest({ body: createItemCategorySchema }),
    controller.createCategory,
  );

  router.get("/units", controller.listUnits);
  router.post(
    "/units",
    validateRequest({ body: createUnitSchema }),
    controller.createUnit,
  );

  router.get("/:id", validateRequest({ params: paramsWithId }), controller.getItem);
  router.patch(
    "/:id",
    validateRequest({ params: paramsWithId, body: updateItemSchema }),
    controller.updateItem,
  );
  router.delete(
    "/:id",
    validateRequest({ params: paramsWithId }),
    controller.deleteItem,
  );

  router.patch(
    "/categories/:id",
    validateRequest({ params: paramsWithId, body: updateItemCategorySchema }),
    controller.updateCategory,
  );
  router.delete(
    "/categories/:id",
    validateRequest({ params: paramsWithId }),
    controller.deleteCategory,
  );

  router.patch(
    "/units/:id",
    validateRequest({ params: paramsWithId, body: updateUnitSchema }),
    controller.updateUnit,
  );
  router.delete(
    "/units/:id",
    validateRequest({ params: paramsWithId }),
    controller.deleteUnit,
  );

  return router;
}
