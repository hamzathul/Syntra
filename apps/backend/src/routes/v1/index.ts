import { Router } from "express";
import authRoutes from "../../modules/auth/auth.routes";

const router: Router = Router();

router.get("/health", (_req, res) => {
  res.json({ status: "ok", message: "Server is up and running" });
});

router.use("/auth", authRoutes);

export default router;
