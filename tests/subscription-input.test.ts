import { describe, expect, it } from "vitest";
import { parseSubscriptionInput } from "../lib/subscription-input";

describe("subscription input", () => {
  it("accepts an arbitrary valid duration", () => expect(parseSubscriptionInput({user_id:"11111111-1111-4111-8111-111111111111",plan:"full",status:"active",starts_at:"2026-11-09T00:00:00Z",expires_at:"2026-11-19T00:00:00Z",source:"complimentary",note:"tester"}).plan).toBe("full"));
  it("rejects a non-positive duration", () => expect(() => parseSubscriptionInput({user_id:"11111111-1111-4111-8111-111111111111",plan:"market",status:"active",starts_at:"2026-11-19T00:00:00Z",expires_at:"2026-11-09T00:00:00Z",source:"manual"})).toThrow("Ngày hết hạn"));
});
