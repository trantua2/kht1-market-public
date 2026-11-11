import { timingSafeEqual } from "node:crypto";
import { NextRequest,NextResponse } from "next/server";
import { requiredEnv } from "@/lib/config";
import { parseMarketSnapshot } from "@/lib/market-validation";
import { createAdminClient } from "@/lib/supabase/admin";
import { invalidateMarketSnapshot } from "@/lib/market-data-cache";
function same(a:string,b:string){const x=Buffer.from(a),y=Buffer.from(b);return x.length===y.length&&timingSafeEqual(x,y)}
export async function POST(req:NextRequest){
  const token=req.headers.get("authorization")?.replace(/^Bearer\s+/i,"")??"";
  if(!same(token,requiredEnv("KHT_MARKET_INGEST_SECRET")))return NextResponse.json({error:"Unauthorized"},{status:401});
  try{
    const snapshot=parseMarketSnapshot(await req.json()),db=createAdminClient();
    const {data:server,error:serverError}=await db.from("market_servers").select("slug,code,name,is_active").eq("slug",snapshot.server.slug).eq("is_active",true).maybeSingle();
    if(serverError)throw serverError;
    if(!server)throw new Error("Máy chủ không tồn tại hoặc đã tắt");
    if(server.code!==snapshot.server.code||server.name!==snapshot.server.name)throw new Error("Thông tin máy chủ không khớp danh mục");
    const {error}=await db.from("market_snapshots").insert({server_slug:snapshot.server.slug,published_at:snapshot.published_at,payload:snapshot});
    if(error)throw error;
    invalidateMarketSnapshot(snapshot.server.slug);
    return NextResponse.json({ok:true,server_slug:snapshot.server.slug,published_at:snapshot.published_at,shop_count:snapshot.shop_count,item_count:snapshot.item_count});
  }catch(e){return NextResponse.json({error:e instanceof Error?e.message:"Invalid snapshot"},{status:400})}
}
