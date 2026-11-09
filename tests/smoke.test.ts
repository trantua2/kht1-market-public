import { describe, expect, it } from "vitest";
import { APP_NAME } from "../lib/config";

describe("hosted app", () => {
  it("uses the commercial product name", () => {
    expect(APP_NAME).toBe("KHT1 Market");
  });
});
