import { Router } from "express";
import { erpAuthMiddleware } from "../../middlewares/erp-auth.middleware";

const router: Router = Router();

router.get("/", erpAuthMiddleware, (_req, res) => {
  res.json({ data: {} });
});

router.patch("/", erpAuthMiddleware, (_req, res) => {
  res.json({ data: {} });
});

export default router;
