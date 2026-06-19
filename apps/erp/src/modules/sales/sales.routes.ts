import { Router } from "express";
import { erpAuthMiddleware } from "../../middlewares/erp-auth.middleware";

const router: Router = Router();

router.get("/", erpAuthMiddleware, (_req, res) => {
  res.json({ data: [], meta: { total: 0 } });
});

router.get("/:id", erpAuthMiddleware, (req, res) => {
  res.json({ data: { id: req.params.id } });
});

router.post("/", erpAuthMiddleware, (_req, res) => {
  res.status(201).json({ data: { id: "stub" } });
});

export default router;
