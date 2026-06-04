import { Request, Response } from "express";
import { asyncHandler } from "@/common/utils/asyncHandler";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import {
  generateAccessToken,
  generateRefreshToken,
} from "@/common/utils/generateToken";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";
import * as authService from "./auth.service";
import { AuthRequest } from "@/common/middleware/auth.middleware";
import { loginWithGoogle } from "./google.service";

/**
 * 🔐 Opciones de cookie CONSISTENTES
 *
 * Desarrollo local:
 * - Por defecto funciona con http://localhost porque `secure` queda en false
 *   y no se fija un domain explícito.
 *
 * Producción:
 * - `secure` se activa automáticamente con NODE_ENV=production.
 * - Si algún despliegue necesita cookies cross-site, se puede configurar
 *   COOKIE_SAMESITE=none y COOKIE_SECURE=true desde variables de entorno.
 * - COOKIE_DOMAIN es opcional; si no se define, el navegador usa el host de la API.
 */
type CookieSameSite = "lax" | "strict" | "none";

function getCookieSameSite(): CookieSameSite {
  const value = process.env.COOKIE_SAMESITE?.toLowerCase();

  if (value === "strict" || value === "none") {
    return value;
  }

  return "lax";
}

function getCookieSecure(sameSite: CookieSameSite): boolean {
  if (process.env.COOKIE_SECURE) {
    return process.env.COOKIE_SECURE === "true";
  }

  return process.env.NODE_ENV === "production" || sameSite === "none";
}

const cookieSameSite = getCookieSameSite();

const cookieOptions = {
  httpOnly: true,
  secure: getCookieSecure(cookieSameSite),
  sameSite: cookieSameSite,
  path: "/",
  ...(process.env.COOKIE_DOMAIN && { domain: process.env.COOKIE_DOMAIN }),
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
    maxAge: 2 * 60 * 60 * 1000, // 2 hours
  });

  res.cookie("refreshToken", result.refreshToken, {
    ...cookieOptions,
    maxAge: 30 * 24 * 60 * 60 * 1000,
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

export const logoutAll = asyncHandler(
  async (req: AuthRequest, res: Response) => {
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
  },
);


/* ============================
   CHANGE PASSWORD
============================ */

function isString(value: unknown): value is string {
  return typeof value === "string";
}

export const changePassword = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ error: "No autorizado" });
  }

  const { currentPassword, newPassword } = req.body as { currentPassword?: unknown; newPassword?: unknown };

  if (!isString(currentPassword) || !isString(newPassword) || newPassword.length < 8) {
    return res.status(400).json({ error: "Contraseña inválida" });
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user?.password) {
    return res.status(400).json({ error: "Esta cuenta no tiene contraseña local" });
  }

  const validPassword = await bcrypt.compare(currentPassword, user.password);

  if (!validPassword) {
    return res.status(400).json({ error: "Contraseña actual incorrecta" });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);

  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword, tokenVersion: { increment: 1 } },
  });

  await prisma.refreshToken.deleteMany({ where: { userId } });

  res.clearCookie("accessToken", cookieOptions);
  res.clearCookie("refreshToken", cookieOptions);
  res.json({ message: "Contraseña actualizada" });
});

/* ============================
   REFRESH
============================ */

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies.refreshToken;

  if (!token) {
    return res.status(401).json({ error: "No autorizado" });
  }

  let decoded: JwtPayload & { id: string };

  try {
    const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET as string);

    if (typeof payload === "string" || typeof payload.id !== "string") {
      return res.status(403).json({ error: "Refresh inválido" });
    }

    decoded = payload as JwtPayload & { id: string };
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
    const valid = await bcrypt.compare(token, dbToken.token);

    if (valid) {
      matchedToken = dbToken;
      break;
    }
  }

  if (!matchedToken) {
    res.clearCookie("accessToken", cookieOptions);
    res.clearCookie("refreshToken", cookieOptions);

    return res.status(403).json({
      error: "Sesión inválida. Inicia sesión nuevamente.",
    });
  }

  if (matchedToken.expiresAt < new Date()) {
    await prisma.refreshToken.deleteMany({
      where: { id: matchedToken.id },
    });

    res.clearCookie("accessToken", cookieOptions);
    res.clearCookie("refreshToken", cookieOptions);

    return res.status(403).json({
      error: "Refresh expirado",
    });
  }

  await prisma.refreshToken.deleteMany({
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
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  const newAccessToken = generateAccessToken({
    id: decoded.id,
    role: decoded.role,
    tokenVersion: decoded.tokenVersion,
  });

  res.cookie("accessToken", newAccessToken, {
  ...cookieOptions,
  maxAge: 2 * 60 * 60 * 1000,
});

res.cookie("refreshToken", newRefreshToken, {
  ...cookieOptions,
  maxAge: 30 * 24 * 60 * 60 * 1000,
});

  res.json({
    message: "Tokens renovados correctamente",
  });
});

/* ============================
   GOOGLE AUTH (PRO VERSION)
============================ */

export const googleAuthController = asyncHandler(
  async (req: Request, res: Response) => {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({
        error: "Google token is required",
      });
    }

    /* =========================
       GOOGLE LOGIN
    ========================= */

    const { user } = await loginWithGoogle(idToken);

    /* =========================
       GENERATE TOKENS
    ========================= */

    const accessToken = generateAccessToken({
      id: user.id,
      role: user.role,
      tokenVersion: user.tokenVersion,
    });

    const refreshToken = generateRefreshToken({
      id: user.id,
      role: user.role,
      tokenVersion: user.tokenVersion,
    });

    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

    /* =========================
       SAVE REFRESH TOKEN
    ========================= */

    await prisma.refreshToken.create({
      data: {
        token: hashedRefreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    /* =========================
       🍪 SET COOKIES (CLAVE)
    ========================= */

    res.cookie("accessToken", accessToken, {
      ...cookieOptions,
      maxAge: 2 * 60 * 60 * 1000, // 2 hours
    });

    res.cookie("refreshToken", refreshToken, {
      ...cookieOptions,
       maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    /* =========================
       RESPONSE
    ========================= */

    return res.json({
      user,
    });
  },
);
