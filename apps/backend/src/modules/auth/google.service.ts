import { OAuth2Client } from 'google-auth-library';
import { prisma } from '@/lib/prisma';
import { generateAccessToken } from '@/common/utils/generateToken';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function loginWithGoogle(idToken: string) {
  /* =========================
     VERIFY TOKEN
  ========================= */

  console.log('GOOGLE_CLIENT_ID =', process.env.GOOGLE_CLIENT_ID);
  console.log('NODE_ENV =', process.env.NODE_ENV);
  console.log(
    'Default cert url:',
    (OAuth2Client as any).GOOGLE_OAUTH2_FEDERATED_SIGNON_PEM_CERTS_URL_,
  );
  console.log('google-auth-library version =', require('google-auth-library/package.json').version);

  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();

  if (!payload || !payload.email) {
    throw new Error('Invalid Google token');
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
        name: name || email.split('@')[0],
        provider: 'GOOGLE',
      },
    });
  }

  /* =========================
   REACTIVATE ACCOUNT
========================= */

  if (!user.isActive) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isActive: true,
      },
    });

    user.isActive = true;
  }
  /* =========================
   LINK GUEST ORDERS
========================= */

  await prisma.order.updateMany({
    where: {
      userId: null,
      email,
    },
    data: {
      userId: user.id,
    },
  });

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
