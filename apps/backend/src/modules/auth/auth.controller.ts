import { sendPasswordResetEmail } from "@/modules/email/sendOrderEmail";
import { Request, Response } from "express";
import { loginWithGoogle } from "./google.service";
import { asyncHandler } from "@/common/utils/asyncHandler";
import { AuthRequest } from "@/common/middleware/auth.middleware";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";
import * as authService from "./auth.service";
import crypto from "crypto";
import {
  generateAccessToken,
  generateRefreshToken,
} from "@/common/utils/generateToken";

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
    return res.status(401).json({ error: "Unauthorized" });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      role: true,
      name: true,
      provider: true,
      createdAt: true,
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

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, name } = req.body;

  if (!email || !password || password.length < 8) {
    return res.status(400).json({
      error: "Invalid registration data",
    });
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return res.status(400).json({
      error: "An account already exists with this email",
    });
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name: name || null,
      provider: "LOCAL",
    },
  });

  await prisma.order.updateMany({
    where: {
      userId: null,
      email,
    },
    data: {
      userId: user.id,
    },
  });

  const payload = {
    id: user.id,
    role: user.role,
    tokenVersion: user.tokenVersion,
  };

  const accessToken = generateAccessToken(payload);

  const refreshToken = generateRefreshToken(payload);

  const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

  await prisma.refreshToken.create({
    data: {
      token: hashedRefreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  res.cookie("accessToken", accessToken, {
    ...cookieOptions,
    maxAge: 2 * 60 * 60 * 1000,
  });

  res.cookie("refreshToken", refreshToken, {
    ...cookieOptions,
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  res.json({
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
  });
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

  res.json({ message: "Successfully signed out" });
});

/* ============================
   LOGOUT ALL
============================ */

export const logoutAll = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
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

    res.json({ message: "Signed out from all devices" });
  },
);

export const deactivateAccount = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        isActive: false,
        marketingEmails: false,
        tokenVersion: {
          increment: 1,
        },
      },
    });

    await prisma.refreshToken.deleteMany({
      where: {
        userId,
      },
    });

    res.clearCookie("accessToken", cookieOptions);
    res.clearCookie("refreshToken", cookieOptions);

    res.json({
      success: true,
    });
  },
);

/* ============================
   CHANGE PASSWORD
============================ */

function isString(value: unknown): value is string {
  return typeof value === "string";
}

export const changePassword = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { currentPassword, newPassword } = req.body as {
      currentPassword?: unknown;
      newPassword?: unknown;
    };

    if (
      !isString(currentPassword) ||
      !isString(newPassword) ||
      newPassword.length < 8
    ) {
      return res.status(400).json({ error: "Invalid password" });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user?.password) {
      return res
        .status(400)
        .json({ error: "This account does not have a local password" });
    }

    const validPassword = await bcrypt.compare(currentPassword, user.password);

    if (!validPassword) {
      return res.status(400).json({ error: "Current password is incorrect" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword, tokenVersion: { increment: 1 } },
    });

    await prisma.refreshToken.deleteMany({ where: { userId } });

    res.clearCookie("accessToken", cookieOptions);
    res.clearCookie("refreshToken", cookieOptions);
    res.json({ message: "Password updated successfully" });
  },
);

export const forgotPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: "Email is required",
      });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    // No revelar si existe o no
    if (!user) {
      return res.json({
        message:
          "If an account exists with this email, a reset link has been sent.",
      });
    }

    const token = crypto.randomBytes(32).toString("hex");

    await prisma.passwordResetToken.deleteMany({
      where: {
        userId: user.id,
      },
    });

    await prisma.passwordResetToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hora
      },
    });

    await sendPasswordResetEmail(user.email, user.name || user.email, token);

    res.json({
      message:
        "If an account exists with this email, a reset link has been sent.",
    });
  },
);

export const resetPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const { token, password } = req.body;

    if (!token || !password || password.length < 8) {
      return res.status(400).json({
        error: "Invalid password",
      });
    }

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: {
        token,
      },
    });

    if (!resetToken || resetToken.expiresAt < new Date()) {
      return res.status(400).json({
        error: "Invalid or expired token",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.user.update({
      where: {
        id: resetToken.userId,
      },
      data: {
        password: hashedPassword,
        tokenVersion: {
          increment: 1,
        },
      },
    });

    await prisma.refreshToken.deleteMany({
      where: {
        userId: resetToken.userId,
      },
    });

    await prisma.passwordResetToken.deleteMany({
      where: {
        userId: resetToken.userId,
      },
    });

    res.json({
      message: "Password reset successfully",
    });
  },
);

/* ============================
   REFRESH
============================ */

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies.refreshToken;

  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  let decoded: JwtPayload & { id: string };

  try {
    const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET as string);

    if (typeof payload === "string" || typeof payload.id !== "string") {
      return res.status(403).json({ error: "Invalid refresh token" });
    }

    decoded = payload as JwtPayload & { id: string };
  } catch {
    res.clearCookie("accessToken", cookieOptions);
    res.clearCookie("refreshToken", cookieOptions);
    return res.status(403).json({ error: "Invalid refresh token" });
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
      error: "Session expired. Please sign in again.",
    });
  }

  if (matchedToken.expiresAt < new Date()) {
    await prisma.refreshToken.deleteMany({
      where: { id: matchedToken.id },
    });

    res.clearCookie("accessToken", cookieOptions);
    res.clearCookie("refreshToken", cookieOptions);

    return res.status(403).json({
      error: "Refresh token expired",
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
    message: "Tokens refreshed successfully",
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
