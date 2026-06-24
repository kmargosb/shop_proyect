"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a, _b, _c, _d, _e, _f, _g, _h, _j;
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
// Load local overrides first, then provide safe defaults so tests can import the
// Express app without requiring real third-party credentials or local services.
dotenv_1.default.config();
(_a = process.env).NODE_ENV || (_a.NODE_ENV = "test");
(_b = process.env).DATABASE_URL || (_b.DATABASE_URL = "postgresql://admin:admin123@localhost:5432/tienda");
(_c = process.env).JWT_ACCESS_SECRET || (_c.JWT_ACCESS_SECRET = "test-access-secret");
(_d = process.env).JWT_REFRESH_SECRET || (_d.JWT_REFRESH_SECRET = "test-refresh-secret");
(_e = process.env).STRIPE_SECRET_KEY || (_e.STRIPE_SECRET_KEY = "sk_test_123456789");
(_f = process.env).RESEND_API_KEY || (_f.RESEND_API_KEY = "re_test_123456789");
(_g = process.env).EMAIL_FROM || (_g.EMAIL_FROM = "test@example.com");
(_h = process.env).TEST_ADMIN_EMAIL || (_h.TEST_ADMIN_EMAIL = "admin@example.com");
(_j = process.env).TEST_ADMIN_PASSWORD || (_j.TEST_ADMIN_PASSWORD = "password123");
