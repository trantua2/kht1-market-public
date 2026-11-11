import {describe,expect,it} from "vitest";
import {createSePayCheckout,isValidSePayIpn} from "../lib/sepay";

describe("SePay checkout",()=>{
  it("creates a signed sandbox bank-transfer form",()=>{
    const checkout=createSePayCheckout({invoiceNumber:"KHT-123",amount:10000,description:"Goi 7 ngay",customerId:"user-1",successUrl:"https://example.com/payment/result?status=success",errorUrl:"https://example.com/payment/result?status=error",cancelUrl:"https://example.com/payment/result?status=cancel"},{merchantId:"SP-TEST-DEMO",secretKey:"spsk_test_demo",environment:"sandbox"});
    expect(checkout.action).toBe("https://pay-sandbox.sepay.vn/v1/checkout/init");
    expect(checkout.fields.payment_method).toBe("BANK_TRANSFER");
    expect(checkout.fields.order_invoice_number).toBe("KHT-123");
    expect(checkout.fields.order_amount).toBe(10000);
    expect(checkout.fields.signature).toMatch(/^[A-Za-z0-9+/]+=*$/);
  });

  it("accepts only a successful order-paid IPN with the configured secret",()=>{
    const body={notification_type:"ORDER_PAID",order:{order_status:"CAPTURED",order_currency:"VND",order_amount:"10000.00",order_invoice_number:"KHT-123"},transaction:{transaction_status:"APPROVED",transaction_amount:"10000",transaction_currency:"VND",transaction_id:"tx-1"}};
    expect(isValidSePayIpn(body,"right","right")).toBe(true);
    expect(isValidSePayIpn(body,"wrong","right")).toBe(false);
    expect(isValidSePayIpn({...body,notification_type:"TRANSACTION_VOID"},"right","right")).toBe(false);
  });
});
