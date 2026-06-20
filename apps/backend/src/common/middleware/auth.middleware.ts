import { Request, Response, NextFunction } from "express";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
    tokenVersion: number;
  };
}

/* =========================
   PROTECT (OBLIGATORIO)
========================= */

export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const token = req.cookies.accessToken;

  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const payload = jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET as string,
    );

    if (typeof payload === "string" || typeof payload.id !== "string" || typeof payload.role !== "string" || typeof payload.tokenVersion !== "number") {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    const decoded = payload as JwtPayload & { id: string; role: string; tokenVersion: number };

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    if (user.tokenVersion !== decoded.tokenVersion) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

/* =========================
   OPTIONAL AUTH (🔥 PERFECTO YA)
========================= */

export const attachUserIfExists = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction,
) => {
  const token = req.cookies.accessToken;

  if (!token) {
    return next();
  }

  try {
    const payload = jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET as string,
    );

    if (typeof payload === "string" || typeof payload.id !== "string" || typeof payload.role !== "string" || typeof payload.tokenVersion !== "number") {
      return next();
    }

    const decoded = payload as JwtPayload & { id: string; role: string; tokenVersion: number };

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (user && user.tokenVersion === decoded.tokenVersion) {
      req.user = decoded;
    }
  } catch {
    // ignorar
  }

  next();
};

/* =========================
   ADMIN ONLY
========================= */

export const adminOnly = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  if (req.user?.role !== Role.ADMIN) {
    return res.status(403).json({ error: "Admin access required" });
  }

  next();
};
