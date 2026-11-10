import {NextRequest,NextResponse} from "next/server";
import {createAdminClient} from "@/lib/supabase/admin";
import {requiredEnv} from "@/lib/config";
import {verifyWebhookSignature} from "@/lib/payos";

export async function POST(request:NextRequest){
  try{
    const body=await request.json();if(!body?.data||typeof body.signature!=="string"||!verifyWebhookSignature(body.data,body.signature,requiredEnv("PAYOS_CHECKSUM_KEY")))return NextResponse.json({error:"Chữ ký không hợp lệ"},{status:401});
    if(body.success!==true||body.data.code!=="00"||body.data.currency!=="VND")return NextResponse.json({success:true,ignored:true});
    const db=createAdminClient();const {data:order,error:readError}=await db.from("payment_orders").select("id").eq("order_code",body.data.orderCode).maybeSingle();if(readError)throw readError;if(!order)return NextResponse.json({success:true,ignored:true});
    const {error}=await db.rpc("complete_payment_order",{p_order_code:body.data.orderCode,p_amount:body.data.amount,p_payment_link_id:body.data.paymentLinkId,p_reference:body.data.reference});if(error)throw error;
    return NextResponse.json({success:true});
  }catch(error){return NextResponse.json({error:error instanceof Error?error.message:"Webhook thất bại"},{status:400})}
}
