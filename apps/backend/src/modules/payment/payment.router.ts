import { Router } from "express";
import {
  createPaymentIntent,
  retryPaymentController,
} from "./payment.controller";

const router = Router();

router.post("/create-intent", createPaymentIntent);

router.post("/retry/:orderId", retryPaymentController);

export default router;