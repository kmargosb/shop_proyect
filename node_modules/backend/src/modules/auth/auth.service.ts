import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";
import { generateAccessToken, generateRefreshToken } from "@/common/utils/generateToken";

const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME = 30 * 60 * 1000; // 30 minutos

export async function loginUser(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error("Credenciales inválidas");
  }

  const now = new Date();

  /* =========================
     AUTO-UNLOCK SI YA EXPIRÓ
  ========================== */

  if (user.lockUntil && user.lockUntil < now) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        loginAttempts: 0,
        lockUntil: null,
      },
    });
  }

  /* =========================
     VERIFICAR SI SIGUE BLOQUEADO
  ========================== */

  if (user.lockUntil && user.lockUntil > now) {
    const remaining = Math.ceil(
      (user.lockUntil.getTime() - now.getTime()) / 60000,
    );

    throw new Error(
      `Cuenta bloqueada. Intenta nuevamente en ${remaining} minutos.`,
    );
  }

  /* =========================
     VALIDAR PASSWORD
  ========================== */

  const validPassword = await bcrypt.compare(password, user.password || "");

  if (!validPassword) {
    const attempts = user.loginAttempts + 1;

    const updateData: any = {
      loginAttempts: attempts,
    };

    if (attempts >= MAX_LOGIN_ATTEMPTS) {
      updateData.lockUntil = new Date(now.getTime() + LOCK_TIME);
    }

    await prisma.user.update({
      where: { id: user.id },
      data: updateData,
    });

    throw new Error("Credenciales inválidas");
  }

  /* =========================
     LOGIN CORRECTO → RESET
  ========================== */

  await prisma.user.update({
    where: { id: user.id },
    data: {
      loginAttempts: 0,
      lockUntil: null,
    },
  });

  /* =========================
     GENERAR TOKENS
  ========================== */

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
      expiresAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
  };
}
