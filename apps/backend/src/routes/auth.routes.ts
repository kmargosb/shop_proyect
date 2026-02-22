import { Router } from "express"
import { login, logout, refresh, logoutAll, me } from "../controllers/auth.controller"
import { loginRateLimiter } from "../middleware/rateLimit.middleware"
import { protect} from "../middleware/auth.middleware"

const router = Router()

router.post("/login", login)
router.post("/logout", logout);
router.post("/refresh", refresh)
router.post("/login", loginRateLimiter, login)
router.post("/logout-all", protect, logoutAll)
router.get("/me", protect, me)

export default router