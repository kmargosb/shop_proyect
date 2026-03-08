import "dotenv/config";
import app from "./app";
import { startJobScheduler } from "@/services/jobs/job.scheduler"

const PORT = 4000;

app.listen(PORT, () => {

  console.log(`🚀 Server running on http://localhost:${PORT}`);

  startJobScheduler()

});