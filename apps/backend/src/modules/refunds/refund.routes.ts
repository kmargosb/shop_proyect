import { Router } from "express"
import { RefundController } from "./refund.controller"

const router = Router()

router.post("/", RefundController.create)

export default router