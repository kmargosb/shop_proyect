import cron from "node-cron";
import { cleanupExpiredOrders } from "@/modules/orders/order.cleanup";

export function startOrderCleanupJob() {

  cron.schedule("*/5 * * * *", async () => {
    console.log("🧹 Running expired order cleanup");

    try {
      await cleanupExpiredOrders();
    } catch (error) {
      console.error("Cleanup error:", error);
    }

  });

}