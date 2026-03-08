import cron from "node-cron"
import { AbandonedCheckoutService } from "./abandoned-checkout.service"

export function startAbandonedCheckoutJob() {

  cron.schedule("*/30 * * * *", async () => {

    console.log("🛒 Checking abandoned orders")

    try {

      await AbandonedCheckoutService.processAbandonedOrders()

    } catch (error) {

      console.error("Abandoned checkout job error:", error)

    }

  })

}