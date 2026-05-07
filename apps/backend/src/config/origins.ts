export const allowedOrigins = (process.env.FRONTEND_URLS ||
  process.env.FRONTEND_URL ||
  "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
