import { Router } from "express";
import authRoutes from "../../modules/auth/auth.routes";
import healthRoutes from "../../modules/health/health.routes";

const router: Router = Router();

router.use("/auth", authRoutes);
router.use("/health", healthRoutes);

export default router;
