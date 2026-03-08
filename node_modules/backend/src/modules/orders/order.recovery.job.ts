import cron from "node-cron"
import { sendAbandonedCheckoutEmails } from "./order.recovery.service"

export function startOrderRecoveryJob() {

  cron.schedule("*/10 * * * *", async () => {

    console.log("🛒 Checking abandoned checkouts")

    try {

      await sendAbandonedCheckoutEmails()

    } catch (error) {

      console.error("Recovery job error:", error)

    }

  })

}