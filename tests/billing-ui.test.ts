import {readFileSync} from "node:fs";
import {describe,expect,it} from "vitest";

describe("billing UI",()=>{
  it("publishes pricing and authenticated checkout routes",()=>{
    const pricing=readFileSync(new URL("../app/pricing/page.tsx",import.meta.url),"utf8");
    const checkout=readFileSync(new URL("../app/api/billing/checkout/route.ts",import.meta.url),"utf8");
    expect(pricing).toContain("BILLING_PRODUCTS");
    expect(pricing).toContain("PricingCards");
    expect(checkout).toContain("createPayOSPaymentLink");
    expect(checkout).toContain("payment_orders");
  });
});
