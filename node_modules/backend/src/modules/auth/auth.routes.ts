import { Router } from "express"
import { login, logout, refresh, logoutAll, me, googleAuthController } from "./auth.controller"
import { loginRateLimiter } from "@/common/middleware/rateLimit.middleware"
import { protect} from "@/common/middleware/auth.middleware"

const router = Router()

router.post("/login", login)
router.post("/logout", logout);
router.post("/refresh", refresh)
router.post("/login", loginRateLimiter, login)
router.post("/logout-all", protect, logoutAll)
router.get("/me", protect, me)
router.post("/google", googleAuthController);

export default router