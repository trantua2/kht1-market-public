import {NextRequest,NextResponse} from "next/server";
import {createClient} from "@/lib/supabase/server";
import {createAdminClient} from "@/lib/supabase/admin";
import {getBillingProduct} from "@/lib/billing-products";
import {createPayOSPaymentLink} from "@/lib/payos";

export async function POST(request:NextRequest){
  try{
    const supabase=await createClient();const {data:{user}}=await supabase.auth.getUser();if(!user)return NextResponse.json({error:"Bạn cần đăng nhập"},{status:401});
    const product=getBillingProduct((await request.json()).product_code);const orderCode=Date.now()*100+Math.floor(Math.random()*100);const origin=request.nextUrl.origin;const description=`KHT${String(orderCode).slice(-6)}`;
    const db=createAdminClient();const {data:order,error:insertError}=await db.from("payment_orders").insert({user_id:user.id,product_code:product.code,duration_days:product.days,amount:product.amount,order_code:orderCode}).select("id").single();if(insertError)throw insertError;
    try{const payment=await createPayOSPaymentLink({orderCode,amount:product.amount,description,buyerEmail:user.email??"",returnUrl:`${origin}/payment/result`,cancelUrl:`${origin}/payment/result`});const {error:updateError}=await db.from("payment_orders").update({provider_payment_id:payment.paymentLinkId,checkout_url:payment.checkoutUrl}).eq("id",order.id);if(updateError)throw updateError;return NextResponse.json({checkout_url:payment.checkoutUrl});}
    catch(error){await db.from("payment_orders").update({status:"failed"}).eq("id",order.id);throw error}
  }catch(error){const message=error instanceof Error?error.message:"Không tạo được thanh toán";return NextResponse.json({error:message},{status:message.startsWith("Thiếu biến môi trường")?503:400})}
}
