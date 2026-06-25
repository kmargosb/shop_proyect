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

  console.log('HTTP_PROXY =', process.env.HTTP_PROXY);
  console.log('HTTPS_PROXY =', process.env.HTTPS_PROXY);
  console.log('http_proxy =', process.env.http_proxy);
  console.log('https_proxy =', process.env.https_proxy);

  const r = await fetch('https://www.googleapis.com/oauth2/v3/certs', {
    headers: {
      'User-Agent': 'Mozilla/5.0',
    },
  });

  console.log('MANUAL GOOGLE STATUS =', r.status);

  const txt = await r.text();

  console.log('MANUAL GOOGLE BODY =', txt.substring(0, 300));

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
