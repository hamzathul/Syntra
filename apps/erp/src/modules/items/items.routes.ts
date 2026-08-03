import { Router } from "express";

const router: Router = Router();

router.get("/", (_req, res) => {
  res.json({ data: [], meta: { total: 0 } });
});

router.get("/:id", (req, res) => {
  res.json({ data: { id: req.params.id } });
});

router.post("/", (_req, res) => {
  res.status(201).json({ data: { id: "stub" } });
});

router.put("/:id", (req, res) => {
  res.json({ data: { id: req.params.id } });
});

router.delete("/:id", (req, res) => {
  res.json({ data: { id: req.params.id } });
});

export default router;
