import { timingSafeEqual } from "node:crypto";
import { NextRequest,NextResponse } from "next/server";
import { requiredEnv } from "@/lib/config";
import { parseMarketSnapshot } from "@/lib/market-validation";
import { createAdminClient } from "@/lib/supabase/admin";
function same(a:string,b:string){const x=Buffer.from(a),y=Buffer.from(b);return x.length===y.length&&timingSafeEqual(x,y)}
export async function POST(req:NextRequest){const token=req.headers.get("authorization")?.replace(/^Bearer\s+/i,"")??"";if(!same(token,requiredEnv("KHT_MARKET_INGEST_SECRET")))return NextResponse.json({error:"Unauthorized"},{status:401});try{const snapshot=parseMarketSnapshot(await req.json());const {error}=await createAdminClient().from("market_snapshots").insert({published_at:snapshot.published_at,payload:snapshot});if(error)throw error;return NextResponse.json({ok:true,published_at:snapshot.published_at,shop_count:snapshot.shop_count,item_count:snapshot.item_count});}catch(e){return NextResponse.json({error:e instanceof Error?e.message:"Invalid snapshot"},{status:400})}}
