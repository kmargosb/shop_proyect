import dotenv from "dotenv";
dotenv.config();

import request from "supertest";
import app from "../src/app";

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
    expect(res.headers["set-cookie"]).toBeDefined();
  });
});