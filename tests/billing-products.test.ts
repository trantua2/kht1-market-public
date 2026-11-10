import { describe, expect, it } from "vitest";
import { BILLING_PRODUCTS, getBillingProduct } from "../lib/billing-products";

describe("billing products", () => {
  it("offers the approved one-time packages", () => {
    expect(BILLING_PRODUCTS.map(({code,days,amount}) => ({code,days,amount}))).toEqual([
      {code:"full_3d",days:3,amount:5_000},
      {code:"full_7d",days:7,amount:10_000},
      {code:"full_15d",days:15,amount:20_000},
      {code:"full_30d",days:30,amount:35_000},
    ]);
  });

  it("rejects a product code not owned by the server", () => {
    expect(() => getBillingProduct("full_999d")).toThrow("Gói thanh toán không hợp lệ");
  });
});
