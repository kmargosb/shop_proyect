import request from "supertest";
import app from "../src/app";

describe("Health Check", () => {
  it("should return backend status", async () => {
    const res = await request(app).get("/");

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("OK");
  });
});