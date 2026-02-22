import { Request, Response, NextFunction } from "express"
import { prisma } from "../lib/prisma"
import jwt from "jsonwebtoken"

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
    tokenVersion: number;
  };
}

export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies.accessToken

  if (!token) {
    return res.status(401).json({ error: "No autorizado" })
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET as string
    ) as any

    // 🔎 Buscar usuario actual en DB
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    })

    if (!user) {
      return res.status(401).json({ error: "Usuario no encontrado" })
    }

    // 🔥 Validar tokenVersion
    if (user.tokenVersion !== decoded.tokenVersion) {
      return res.status(401).json({ error: "Token inválido" })
    }

    req.user = decoded
    next()
  } catch {
    return res.status(401).json({ error: "Token inválido o expirado" })
  }
}

export const adminOnly = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (req.user?.role !== "ADMIN") {
    return res.status(403).json({ error: "Solo administradores" })
  }

  next()
}