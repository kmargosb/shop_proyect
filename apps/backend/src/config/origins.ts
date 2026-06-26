const envOrigins = (process.env.FRONTEND_URLS ?? process.env.FRONTEND_URL ?? '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

export const allowedOrigins = [
  ...new Set(['http://localhost:3000', 'http://127.0.0.1:3000', ...envOrigins]),
];
