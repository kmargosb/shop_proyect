import dotenv from "dotenv";

// Load local overrides first, then provide safe defaults so tests can import the
// Express app without requiring real third-party credentials or local services.
dotenv.config();

process.env.NODE_ENV ||= "test";
process.env.DATABASE_URL ||= "postgresql://admin:admin123@localhost:5432/tienda";
process.env.JWT_ACCESS_SECRET ||= "test-access-secret";
process.env.JWT_REFRESH_SECRET ||= "test-refresh-secret";
process.env.STRIPE_SECRET_KEY ||= "sk_test_123456789";
process.env.RESEND_API_KEY ||= "re_test_123456789";
process.env.EMAIL_FROM ||= "test@example.com";
process.env.TEST_ADMIN_EMAIL ||= "admin@example.com";
process.env.TEST_ADMIN_PASSWORD ||= "password123";
