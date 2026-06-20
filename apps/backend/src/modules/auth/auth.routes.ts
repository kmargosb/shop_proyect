import { Router } from "express";
import { loginRateLimiter } from "@/common/middleware/rateLimit.middleware";
import { protect } from "@/common/middleware/auth.middleware";
import {
  me,  
  login,
  logout,
  refresh,
  logoutAll,
  resetPassword,
  forgotPassword,
  changePassword,
  googleAuthController,  
} from "./auth.controller";

const router = Router();

router.post("/login", loginRateLimiter, login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/logout", logout);
router.post("/refresh", refresh);
router.post("/logout-all", protect, logoutAll);
router.post("/change-password", protect, changePassword);
router.get("/me", protect, me);
router.post("/google", googleAuthController);

export default router;
