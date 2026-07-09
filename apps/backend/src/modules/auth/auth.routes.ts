import { Router } from "express";
import rateLimit from "express-rate-limit";
import { validateRequest } from "backend-p";
import {
  loginRequestSchema,
  registerRequestSchema,
  refreshRequestSchema,
  logoutRequestSchema,
  changePasswordRequestSchema,
} from "shared";
import { AuthModuleFactory } from "./auth.factory";

const router: Router = Router();
const authController = AuthModuleFactory.createController();
const authenticate = AuthModuleFactory.createAuthMiddleware();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
});

router.post(
  "/register",
  authLimiter,
  validateRequest({ body: registerRequestSchema }),
  authController.register,
);

router.post(
  "/login",
  authLimiter,
  validateRequest({ body: loginRequestSchema }),
  authController.login,
);

router.post(
  "/refresh",
  validateRequest({ body: refreshRequestSchema }),
  authController.refresh,
);

router.post(
  "/logout",
  validateRequest({ body: logoutRequestSchema }),
  authController.logout,
);

router.post(
  "/change-password",
  authenticate,
  validateRequest({ body: changePasswordRequestSchema }),
  authController.changePassword,
);

router.get("/me", authenticate, authController.getMe);

export default router;
