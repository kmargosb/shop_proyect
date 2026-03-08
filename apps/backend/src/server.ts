import "dotenv/config";
import app from "./app";

import { startOrderCleanupJob } from "./modules/orders/orderCleanup.job";
import { startAbandonedCheckoutJob } from "./modules/marketing/abandoned-checkout.job";

const PORT = 4000;

app.listen(PORT, () => {

  console.log(`🚀 Server running on http://localhost:${PORT}`);

  startOrderCleanupJob()

  startAbandonedCheckoutJob()

});