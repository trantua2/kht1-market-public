import { describe, expect, it } from "vitest";
import { BILLING_PRODUCTS, getBillingProduct } from "../lib/billing-products";

describe("billing products", () => {
  it("offers the approved one-time packages", () => {
    expect(BILLING_PRODUCTS.map(({code,plan,days,amount}) => ({code,plan,days,amount}))).toEqual([
      {code:"market_3d",plan:"market",days:3,amount:3_000},
      {code:"market_7d",plan:"market",days:7,amount:6_000},
      {code:"market_15d",plan:"market",days:15,amount:12_000},
      {code:"market_30d",plan:"market",days:30,amount:20_000},
    ]);
  });

  it("rejects a product code not owned by the server", () => {
    expect(() => getBillingProduct("full_999d")).toThrow("Gói thanh toán không hợp lệ");
  });
});
