import cron from "node-cron"

import { cleanupExpiredOrders } from "@/modules/orders/order.cleanup"
import { cleanupExpiredCarts } from "@/modules/cart/cart.cleanup.job"
import { AbandonedCheckoutService } from "@/modules/marketing/abandoned-checkout.service"

export function startJobScheduler() {

  /* ===============================
     ORDER CLEANUP
  =============================== */

  cron.schedule("*/5 * * * *", async () => {

    console.log("🧹 Running expired order cleanup")

    try {

      await cleanupExpiredOrders()

    } catch (error) {

      console.error("Order cleanup error:", error)

    }

  })

  /* ===============================
     CART CLEANUP
  =============================== */

  cron.schedule("0 * * * *", async () => {

    console.log("🧹 Running expired cart cleanup")

    try {

      await cleanupExpiredCarts()

    } catch (error) {

      console.error("Cart cleanup error:", error)

    }

  })

  /* ===============================
     ABANDONED CHECKOUT
  =============================== */

  cron.schedule("*/30 * * * *", async () => {

    console.log("🛒 Checking abandoned orders")

    try {

      await AbandonedCheckoutService.processAbandonedOrders()

    } catch (error) {

      console.error("Abandoned checkout error:", error)

    }

  })

}