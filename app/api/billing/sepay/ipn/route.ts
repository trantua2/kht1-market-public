import {NextRequest,NextResponse} from "next/server";
import {createAdminClient} from "@/lib/supabase/admin";
import {requiredEnv} from "@/lib/config";
import {isValidSePayIpn} from "@/lib/sepay";

export async function POST(request:NextRequest){
  try{
    const body=await request.json();
    if(!isValidSePayIpn(body,request.headers.get("x-secret-key"),requiredEnv("SEPAY_IPN_SECRET")))return NextResponse.json({error:"IPN không hợp lệ"},{status:401});
    const invoiceNumber=String(body.order.order_invoice_number);const amount=Number(body.order.order_amount);const db=createAdminClient();
    const {data:order,error:readError}=await db.from("payment_orders").select("order_code,amount,currency").eq("provider_invoice_number",invoiceNumber).maybeSingle();
    if(readError)throw readError;if(!order)return NextResponse.json({success:true,ignored:true});
    if(order.amount!==amount||order.currency!=="VND")return NextResponse.json({error:"Số tiền không khớp"},{status:400});
    const paymentId=String(body.order.id??body.order.order_id??invoiceNumber);const reference=String(body.transaction.transaction_id);
    const {error}=await db.rpc("complete_payment_order",{p_order_code:order.order_code,p_amount:amount,p_payment_link_id:paymentId,p_reference:reference});if(error)throw error;
    return NextResponse.json({success:true});
  }catch(error){return NextResponse.json({error:error instanceof Error?error.message:"IPN thất bại"},{status:400})}
}
