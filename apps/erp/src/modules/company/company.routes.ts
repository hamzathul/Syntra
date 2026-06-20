import { Router } from "express";
import { CompanyController } from "./company.controller";

export function createCompanyRouter(controller: CompanyController): Router {
  const router = Router();

  router.get("/", controller.list);
  router.post("/", CompanyController.validations.create, controller.create);

  return router;
}
