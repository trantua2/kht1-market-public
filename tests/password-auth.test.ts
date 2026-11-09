import { describe, expect, it } from "vitest";
import { parseCredentials } from "../lib/password-auth";

describe("password credentials", () => {
  it("normalizes a valid email and accepts a strong password", () => {
    expect(parseCredentials({ email: " User@Example.com ", password: "password-123" })).toEqual({
      email: "user@example.com",
      password: "password-123",
    });
  });

  it("rejects an invalid email or short password", () => {
    expect(() => parseCredentials({ email: "bad", password: "1234567" })).toThrow();
  });
});
