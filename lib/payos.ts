import {createHmac,timingSafeEqual} from "node:crypto";
import {requiredEnv} from "@/lib/config";

type SignatureValue=string|number|boolean|null|undefined|Record<string,unknown>[];
type SignatureData=Record<string,SignatureValue>;

function canonicalValue(value:SignatureValue):string{
  if(value===null||value===undefined||value==="null"||value==="undefined")return "";
  if(Array.isArray(value))return JSON.stringify(value.map(item=>Object.fromEntries(Object.entries(item).sort(([a],[b])=>a.localeCompare(b)))));
  return String(value);
}

export function canonicalPayOSData(data:SignatureData):string{
  return Object.keys(data).sort().map(key=>`${key}=${canonicalValue(data[key])}`).join("&");
}

export function createPaymentSignature(data:{amount:number;cancelUrl:string;description:string;orderCode:number;returnUrl:string},checksumKey:string):string{
  const {amount,cancelUrl,description,orderCode,returnUrl}=data;
  return createHmac("sha256",checksumKey).update(canonicalPayOSData({amount,cancelUrl,description,orderCode,returnUrl})).digest("hex");
}

export function verifyWebhookSignature(data:SignatureData,signature:string,checksumKey:string):boolean{
  const expected=createHmac("sha256",checksumKey).update(canonicalPayOSData(data)).digest();
  let received:Buffer;
  try{received=Buffer.from(signature,"hex");}catch{return false}
  return received.length===expected.length&&timingSafeEqual(received,expected);
}

export async function createPayOSPaymentLink(input:{orderCode:number;amount:number;description:string;buyerEmail:string;returnUrl:string;cancelUrl:string}){
  const checksumKey=requiredEnv("PAYOS_CHECKSUM_KEY");
  const payload={...input,signature:createPaymentSignature(input,checksumKey)};
  const response=await fetch("https://api-merchant.payos.vn/v2/payment-requests",{method:"POST",headers:{"content-type":"application/json","x-client-id":requiredEnv("PAYOS_CLIENT_ID"),"x-api-key":requiredEnv("PAYOS_API_KEY")},body:JSON.stringify(payload),cache:"no-store"});
  const result=await response.json();
  if(!response.ok||result.code!=="00"||!result.data?.checkoutUrl)throw new Error(result.desc||"Không thể tạo link thanh toán");
  return result.data as {checkoutUrl:string;paymentLinkId:string;qrCode:string;orderCode:number};
}
