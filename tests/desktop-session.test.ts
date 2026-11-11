import { describe, expect, it } from "vitest";
import { readBearerToken } from "../lib/desktop-session";

describe("desktop bearer token", () => {
  it("reads a bearer token case-insensitively", () => {
    expect(readBearerToken("bearer abc")).toBe("abc");
  });

  it("rejects missing and malformed authorization", () => {
    expect(readBearerToken(null)).toBeNull();
    expect(readBearerToken("Basic abc")).toBeNull();
    expect(readBearerToken("Bearer ")).toBeNull();
  });
});
