import { Request, Response, NextFunction } from "express"
import { Prisma } from "@prisma/client"

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error("🔥 Error:", err)

  // Prisma errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    return res.status(400).json({
      success: false,
      message: err.message,
    })
  }

  // Validación
  if (err.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: err.message,
    })
  }

  // Error genérico
  return res.status(500).json({
    success: false,
    message: "Error interno del servidor",
  })
}