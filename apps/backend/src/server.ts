import "dotenv/config";
import app from "./app";
import { createServer } from "http";
import { Server } from "socket.io";
import { startJobScheduler } from "@/services/jobs/job.scheduler";
import { setIO } from "@/lib/socket";
import { allowedOrigins } from "@/config/origins";

const PORT = process.env.PORT || 4000;

/* ================= HTTP SERVER ================= */

const httpServer = createServer(app);

/* ================= SOCKET.IO ================= */

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

/* 🔥 guardamos instancia global (IMPORTANTE) */
setIO(io);

/* ================= SOCKET EVENTS ================= */

io.on("connection", (socket) => {
  console.log("🟢 Admin conectado:", socket.id);

  socket.on("disconnect", () => {
    console.log("🔴 Admin desconectado:", socket.id);
  });
});

/* ================= START SERVER ================= */

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);

  /* 🔥 jobs (no bloquear arranque) */
  try {
    startJobScheduler();
  } catch (err) {
    console.error("❌ Job scheduler error:", err);
  }
});
