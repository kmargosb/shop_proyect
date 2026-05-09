import request from "supertest";

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

import app from "../src/app";
import { loginUser } from "../src/modules/auth/auth.service";

const email = process.env.TEST_ADMIN_EMAIL!;
const password = process.env.TEST_ADMIN_PASSWORD!;

describe("Auth", () => {
  it("should login admin and set auth cookies", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({
        email,
        password,
      });

    expect(res.statusCode).toBe(200);
    expect(loginUser).toHaveBeenCalledWith(email, password);
    expect(res.headers["set-cookie"]).toEqual(
      expect.arrayContaining([
        expect.stringContaining("accessToken=test-access-token"),
        expect.stringContaining("refreshToken=test-refresh-token"),
      ]),
    );
  });
});
