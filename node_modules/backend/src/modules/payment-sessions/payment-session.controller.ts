import { Request, Response } from "express"
import { PaymentSessionService } from "./payment-session.service"

export const createPaymentSession = async (req: Request, res: Response) => {

  try {

    const { orderId, method } = req.body

    if (!orderId || !method) {
      return res.status(400).json({
        error: "orderId and method required"
      })
    }

    const session = await PaymentSessionService.createSession(orderId, method)

    const paymentIntent = await PaymentSessionService.createPaymentIntent(session.id)

    res.json({
      sessionId: session.id,
      clientSecret: paymentIntent.client_secret
    })

  } catch (error: any) {

    console.error("Payment session error:", error)

    res.status(500).json({
      error: error.message
    })

  }

}