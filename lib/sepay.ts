import {timingSafeEqual} from "node:crypto";
import {SePayPgClient} from "sepay-pg-node";
import {requiredEnv} from "@/lib/config";

type SePayEnvironment="sandbox"|"production";
type CheckoutInput={invoiceNumber:string;amount:number;description:string;customerId:string;successUrl:string;errorUrl:string;cancelUrl:string};
type SePayConfig={merchantId:string;secretKey:string;environment:SePayEnvironment};

function defaultConfig():SePayConfig{return {merchantId:requiredEnv("SEPAY_MERCHANT_ID"),secretKey:requiredEnv("SEPAY_SECRET_KEY"),environment:process.env.SEPAY_ENV==="production"?"production":"sandbox"}}

export function createSePayCheckout(input:CheckoutInput,config=defaultConfig()){
  const client=new SePayPgClient({env:config.environment,merchant_id:config.merchantId,secret_key:config.secretKey});
  return {action:client.checkout.initCheckoutUrl(),fields:client.checkout.initOneTimePaymentFields({operation:"PURCHASE",payment_method:"BANK_TRANSFER",order_invoice_number:input.invoiceNumber,order_amount:input.amount,currency:"VND",order_description:input.description,customer_id:input.customerId,success_url:input.successUrl,error_url:input.errorUrl,cancel_url:input.cancelUrl})};
}

function secretsMatch(received:string,expected:string){const left=Buffer.from(received);const right=Buffer.from(expected);return left.length===right.length&&timingSafeEqual(left,right)}

export function isValidSePayIpn(body:any,receivedSecret:string|null,expectedSecret:string){
  return Boolean(receivedSecret&&secretsMatch(receivedSecret,expectedSecret)&&body?.notification_type==="ORDER_PAID"&&body?.order?.order_status==="CAPTURED"&&body?.order?.order_currency==="VND"&&body?.order?.order_invoice_number&&Number.isFinite(Number(body?.order?.order_amount))&&body?.transaction?.transaction_status==="APPROVED"&&body?.transaction?.transaction_currency==="VND"&&Number(body?.transaction?.transaction_amount)===Number(body?.order?.order_amount)&&body?.transaction?.transaction_id);
}
