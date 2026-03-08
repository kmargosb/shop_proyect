import { Router } from "express"
import { checkoutController } from "./checkout.controller"

const router = Router()

router.post("/", checkoutController)

export default router