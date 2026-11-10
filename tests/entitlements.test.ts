import { describe, expect, it } from "vitest";
import { evaluateEntitlement } from "../lib/entitlements";

const now = new Date("2026-11-09T10:00:00Z");
describe("evaluateEntitlement", () => {
  it("denies users without a subscription", () => expect(evaluateEntitlement(null, now).features).toEqual([]));
  it("grants market access to active market users", () => expect(evaluateEntitlement({plan:"market",status:"active",starts_at:"2026-11-01T00:00:00Z",expires_at:"2026-12-01T00:00:00Z"}, now).features).toEqual(["market.read"]));
  it("grants customer features without the admin scanner to active full users", () => expect(evaluateEntitlement({plan:"full",status:"active",starts_at:"2026-11-01T00:00:00Z",expires_at:"2026-12-01T00:00:00Z"}, now).features).toEqual(["market.read","quest.run","agent.download"]));
  it("denies expired and paused subscriptions", () => {
    const expired=evaluateEntitlement({plan:"full",status:"active",starts_at:"2026-10-01T00:00:00Z",expires_at:"2026-11-09T10:00:00Z"}, now);
    expect(expired.features).toEqual([]);
    expect(expired.status).toBe("expired");
    expect(evaluateEntitlement({plan:"full",status:"paused",starts_at:"2026-11-01T00:00:00Z",expires_at:"2026-12-01T00:00:00Z"}, now).features).toEqual([]);
  });
});
