import { Router } from "express";
import { validateRequest } from "backend-p";
import { createCompanySchema } from "shared";
import type { CompanyController } from "./company.controller";

export function createCompanyRouter(controller: CompanyController): Router {
  const router = Router();

  router.get("/", controller.list);
  router.post("/", validateRequest({ body: createCompanySchema }), controller.create);

  return router;
}
