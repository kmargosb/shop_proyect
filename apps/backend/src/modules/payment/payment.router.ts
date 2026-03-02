import { Router } from "express";
import { createPaymentIntent } from "./payment.controller";

const router = Router();

router.post("/create-intent", createPaymentIntent);

export default router;