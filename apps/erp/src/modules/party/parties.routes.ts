import { Router } from "express";
import { validateRequest } from "backend-p";
import { z } from "zod";
import { createPartySchema, updatePartySchema } from "shared";
import type { PartiesController } from "./parties.controller";

const paramsWithId = z.object({ id: z.string().min(1) });

export function createPartiesRouter(controller: PartiesController): Router {
  const router = Router();

  router.get("/", controller.listParties);
  router.post(
    "/",
    validateRequest({ body: createPartySchema }),
    controller.createParty,
  );

  router.get("/:id", validateRequest({ params: paramsWithId }), controller.getParty);
  router.patch(
    "/:id",
    validateRequest({ params: paramsWithId, body: updatePartySchema }),
    controller.updateParty,
  );
  router.delete(
    "/:id",
    validateRequest({ params: paramsWithId }),
    controller.deleteParty,
  );

  return router;
}