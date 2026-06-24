"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
jest.mock("../src/modules/auth/auth.service", () => ({
    loginUser: jest.fn().mockResolvedValue({
        accessToken: "test-access-token",
        refreshToken: "test-refresh-token",
        user: {
            id: "test-user-id",
            email: "admin@example.com",
            role: "ADMIN",
        },
    }),
}));
const app_1 = __importDefault(require("../src/app"));
const auth_service_1 = require("../src/modules/auth/auth.service");
const email = process.env.TEST_ADMIN_EMAIL;
const password = process.env.TEST_ADMIN_PASSWORD;
describe("Auth", () => {
    it("should login admin and set auth cookies", async () => {
        const res = await (0, supertest_1.default)(app_1.default)
            .post("/auth/login")
            .send({
            email,
            password,
        });
        expect(res.statusCode).toBe(200);
        expect(auth_service_1.loginUser).toHaveBeenCalledWith(email, password);
        expect(res.headers["set-cookie"]).toEqual(expect.arrayContaining([
            expect.stringContaining("accessToken=test-access-token"),
            expect.stringContaining("refreshToken=test-refresh-token"),
        ]));
    });
});
