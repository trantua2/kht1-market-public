import { describe, expect, it } from "vitest";
import { safeNextPath } from "../lib/auth";
describe("safeNextPath", () => {
  it("keeps internal paths", () => expect(safeNextPath("/market?city=x")).toBe("/market?city=x"));
  it("rejects external and protocol-relative redirects", () => { expect(safeNextPath("https://evil.test")).toBe("/market"); expect(safeNextPath("//evil.test")).toBe("/market"); });
});
