import { Router } from "express";
import { validateRequest } from "backend-p";
import { z } from "zod";
import { createBankSchema, updateBankSchema } from "shared";
import type { BanksController } from "./banks.controller";

const paramsWithId = z.object({ id: z.string().min(1) });

export function createBanksRouter(controller: BanksController): Router {
  const router = Router();

  router.get("/", controller.list);
  router.post("/", validateRequest({ body: createBankSchema }), controller.create);
  router.patch(
    "/:id",
    validateRequest({ params: paramsWithId, body: updateBankSchema }),
    controller.update,
  );
  router.delete("/:id", validateRequest({ params: paramsWithId }), controller.delete);

  return router;
}