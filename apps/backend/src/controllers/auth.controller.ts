import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { prisma } from "../lib/prisma";
import bcrypt from "bcrypt";
import { generateAccessToken, generateRefreshToken } from "../utils/generateToken";
import jwt from "jsonwebtoken";
import * as authService from "../services/auth.service";
import { AuthRequest } from "../middleware/auth.middleware";

/**
 * 🔐 Opciones de cookie CONSISTENTES
 * Deben ser EXACTAMENTE iguales en:
 * - cookie()
 * - clearCookie()
 */
const cookieOptions = {
  httpOnly: true,
  secure: false, // desarrollo
  sameSite: "lax" as const,
  path: "/",
  domain: "localhost", // 👈 obligatorio si se usa al crear
};

/* ============================
   ME
============================ */

export const me = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ error: "No autorizado" });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      role: true,
    },
  });

  res.json({ user });
});

/* ============================
   LOGIN
============================ */

export const login = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { email, password } = req.body;

  const result = await authService.loginUser(email, password);

  res.cookie("accessToken", result.accessToken, {
    ...cookieOptions,
    maxAge: 60 * 60 * 1000, // 1hora
  });

  res.cookie("refreshToken", result.refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json({ user: result.user });
});

/* ============================
   LOGOUT
============================ */

export const logout = asyncHandler(async (req: AuthRequest, res: Response) => {
  const token = req.cookies.refreshToken;

  if (token) {
    await prisma.refreshToken.deleteMany({
      where: { userId: req.user?.id },
    });
  }

  res.clearCookie("accessToken", cookieOptions);
  res.clearCookie("refreshToken", cookieOptions);

  res.json({ message: "Logout exitoso" });
});

/* ============================
   LOGOUT ALL
============================ */

export const logoutAll = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ error: "No autorizado" });
  }

  await prisma.refreshToken.deleteMany({
    where: { userId },
  });

  await prisma.user.update({
    where: { id: userId },
    data: {
      tokenVersion: { increment: 1 },
    },
  });

  res.clearCookie("accessToken", cookieOptions);
  res.clearCookie("refreshToken", cookieOptions);

  res.json({ message: "Sesión cerrada en todos los dispositivos" });
});

/* ============================
   REFRESH
============================ */

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies.refreshToken;

  if (!token) {
    return res.status(401).json({ error: "No autorizado" });
  }

  let decoded: any;

  try {
    decoded = jwt.verify(
      token,
      process.env.JWT_REFRESH_SECRET as string
    );
  } catch {
    res.clearCookie("accessToken", cookieOptions);
    res.clearCookie("refreshToken", cookieOptions);
    return res.status(403).json({ error: "Refresh inválido" });
  }

  const storedTokens = await prisma.refreshToken.findMany({
    where: { userId: decoded.id },
  });

  let matchedToken = null;

  for (const dbToken of storedTokens) {
    const isValid = await bcrypt.compare(token, dbToken.token);

    if (isValid) {
      matchedToken = dbToken;
      break;
    }
  }

  if (!matchedToken) {
    // 🔥 Posible reuse attack
    await prisma.user.update({
      where: { id: decoded.id },
      data: { tokenVersion: { increment: 1 } },
    });

    await prisma.refreshToken.deleteMany({
      where: { userId: decoded.id },
    });

    res.clearCookie("accessToken", cookieOptions);
    res.clearCookie("refreshToken", cookieOptions);

    return res.status(403).json({
      error: "Sesión inválida. Se cerraron todas las sesiones.",
    });
  }

  if (matchedToken.expiresAt < new Date()) {
    await prisma.refreshToken.delete({
      where: { id: matchedToken.id },
    });

    res.clearCookie("accessToken", cookieOptions);
    res.clearCookie("refreshToken", cookieOptions);

    return res.status(403).json({ error: "Refresh expirado" });
  }

  // Rotación real
  await prisma.refreshToken.delete({
    where: { id: matchedToken.id },
  });

  const newRefreshToken = generateRefreshToken({
    id: decoded.id,
    role: decoded.role,
    tokenVersion: decoded.tokenVersion,
  });

  const hashedRefreshToken = await bcrypt.hash(newRefreshToken, 10);

  await prisma.refreshToken.create({
    data: {
      token: hashedRefreshToken,
      userId: decoded.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  const newAccessToken = generateAccessToken({
    id: decoded.id,
    role: decoded.role,
    tokenVersion: decoded.tokenVersion,
  });

  res.cookie("accessToken", newAccessToken, {
    ...cookieOptions,
    maxAge: 60 * 60 * 1000, // 1 hora
  });

  res.cookie("refreshToken", newRefreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json({ message: "Tokens renovados correctamente" });
});