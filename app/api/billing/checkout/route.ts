import {NextRequest,NextResponse} from "next/server";
import {createClient} from "@/lib/supabase/server";
import {createAdminClient} from "@/lib/supabase/admin";
import {getBillingProduct} from "@/lib/billing-products";
import {createSePayCheckout} from "@/lib/sepay";

export async function POST(request:NextRequest){
  try{
    const supabase=await createClient();const {data:{user}}=await supabase.auth.getUser();if(!user)return NextResponse.json({error:"Bạn cần đăng nhập"},{status:401});
    const product=getBillingProduct((await request.json()).product_code);const orderCode=Date.now()*100+Math.floor(Math.random()*100);const invoiceNumber=`KHT-${orderCode}`;const origin=request.nextUrl.origin;const description=`KHT ${product.days} ngay`;
    const db=createAdminClient();const {data:order,error:insertError}=await db.from("payment_orders").insert({user_id:user.id,product_code:product.code,duration_days:product.days,amount:product.amount,order_code:orderCode,provider:"sepay",provider_invoice_number:invoiceNumber}).select("id").single();if(insertError)throw insertError;
    try{const payment=createSePayCheckout({invoiceNumber,amount:product.amount,description,customerId:user.id,successUrl:`${origin}/payment/result?status=success`,errorUrl:`${origin}/payment/result?status=error`,cancelUrl:`${origin}/payment/result?status=cancel`});return NextResponse.json({checkout_url:payment.action,fields:payment.fields});}
    catch(error){await db.from("payment_orders").update({status:"failed"}).eq("id",order.id);throw error}
  }catch(error){const message=error instanceof Error?error.message:"Không tạo được thanh toán";return NextResponse.json({error:message},{status:message.startsWith("Thiếu biến môi trường")?503:400})}
}
