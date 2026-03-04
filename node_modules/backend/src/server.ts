import "dotenv/config";
import app from "./app";
import { startOrderCleanupJob } from "./modules/orders/orderCleanup.job";

const PORT = 4000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);

  startOrderCleanupJob()
});