"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../src/app"));
describe("Health Check", () => {
    it("should return backend status", async () => {
        const res = await (0, supertest_1.default)(app_1.default).get("/");
        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe("OK");
    });
});
