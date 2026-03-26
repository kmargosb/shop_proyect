import { OAuth2Client } from "google-auth-library";
import { prisma } from "@/lib/prisma";
import { generateAccessToken } from "@/common/utils/generateToken";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function loginWithGoogle(idToken: string) {
  /* =========================
     VERIFY TOKEN
  ========================= */

  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();

  if (!payload || !payload.email) {
    throw new Error("Invalid Google token");
  }

  const { email, name } = payload;

  /* =========================
     FIND OR CREATE USER
  ========================= */

  let user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        name: name || email.split("@")[0],
        provider: "GOOGLE", // 🔥 importante
      },
    });
  }

  /* =========================
     GENERATE JWT
  ========================= */

  const token = generateAccessToken({
  id: user.id,
  role: user.role,
  tokenVersion: user.tokenVersion,
});

  return {
    user,
    token,
  };
}