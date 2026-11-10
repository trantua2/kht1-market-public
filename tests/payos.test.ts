import { describe, expect, it } from "vitest";
import { createPaymentSignature, verifyWebhookSignature } from "../lib/payos";

describe("payOS signatures", () => {
  it("signs payment-link fields in alphabetical order", () => {
    const fields={amount:10000,cancelUrl:"https://example.com/cancel",description:"KHT123",orderCode:123,returnUrl:"https://example.com/success"};
    const expected="6a5f04631f57a3869afe6dc75f0eede879b747ddb3b0a3edbc1b0b6bf2e7858d";
    expect(createPaymentSignature(fields,"secret")).toBe(expected);
    expect(createPaymentSignature({...fields,buyerEmail:"buyer@example.com"} as typeof fields,"secret")).toBe(expected);
  });

  it("rejects a modified webhook", () => {
    const data={amount:5000,code:"00",currency:"VND",description:"KHT123",orderCode:123,paymentLinkId:"link",reference:"ref"};
    const signature="893b7ff5894d42ea29dffe0e7271a0485df89632ae694f85b66c829baf048f75";
    expect(verifyWebhookSignature(data,signature,"secret")).toBe(true);
    expect(verifyWebhookSignature({...data,amount:10000},signature,"secret")).toBe(false);
  });
});
