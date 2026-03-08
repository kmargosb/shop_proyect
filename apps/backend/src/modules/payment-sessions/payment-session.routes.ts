import { Router } from "express"
import { createPaymentSession } from "./payment-session.controller"

const router = Router()

router.post("/", createPaymentSession)

export default router