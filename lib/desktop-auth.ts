import { createHash, randomBytes } from "node:crypto";
import { z } from "zod";

const inputSchema = z.object({
  callback: z.string().url(),
  challenge: z.string().min(43).max(128).regex(/^[A-Za-z0-9_-]+$/),
  state: z.string().min(16).max(200).regex(/^[A-Za-z0-9._~-]+$/),
});

export function base64url(value: Buffer) {
  return value.toString("base64url");
}

export function challengeForVerifier(verifier: string) {
  return base64url(createHash("sha256").update(verifier).digest());
}

export function hashOpaqueToken(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function newOpaqueToken(bytes = 32) {
  return base64url(randomBytes(bytes));
}

export function validateDesktopAuthorizeRequest(value: unknown) {
  const parsed = inputSchema.parse(value);
  const callback = new URL(parsed.callback);
  if (callback.protocol !== "http:" || callback.hostname !== "127.0.0.1" || !callback.port || callback.pathname !== "/auth/callback") {
    throw new Error("Callback desktop không hợp lệ");
  }
  return {...parsed, callback};
}
