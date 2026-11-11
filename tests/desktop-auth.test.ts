import { describe, expect, it } from "vitest";
import { challengeForVerifier, validateDesktopAuthorizeRequest } from "../lib/desktop-auth";

describe("desktop authorization", () => {
  it("accepts only loopback callbacks and valid PKCE challenges", () => {
    const verifier = "a".repeat(64);
    const challenge = challengeForVerifier(verifier);
    expect(validateDesktopAuthorizeRequest({callback:"http://127.0.0.1:43123/auth/callback",challenge,state:"state-1234567890"}).callback.port).toBe("43123");
  });
  it("rejects non-loopback and weak inputs", () => {
    expect(() => validateDesktopAuthorizeRequest({callback:"https://evil.test/cb",challenge:"x",state:"x"})).toThrow();
  });
});
