import express from "express"
import cors from "cors"
import "dotenv/config"
import productRoutes from "./routes/product.routes"
import { errorHandler } from "./middleware/error.middleware"
import authRoutes from "./routes/auth.routes"
import cookieParser from "cookie-parser";

const app = express()

app.use(express.json())
app.use(cookieParser());
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use("/auth", authRoutes)
app.get("/", (req, res) => {
  res.json({
    status: "OK",
    message: "Backend funcionando correctamente",
  })
})

app.use("/products", productRoutes)

// 🔥 Middleware global de errores
app.use(errorHandler)

const PORT = 4000

app.listen(PORT, () => {
  console.log("Servidor backend en http://localhost:" + PORT)
})