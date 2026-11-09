import { NextResponse } from "next/server";
import { currentEntitlement } from "@/lib/current-entitlement";
import { createAdminClient } from "@/lib/supabase/admin";
export async function GET(){ const {user,entitlement}=await currentEntitlement(); if(!user)return NextResponse.json({error:"Đăng nhập bắt buộc"},{status:401}); if(!entitlement.features.includes("market.read"))return NextResponse.json({error:"Gói Market hoặc Full đang hoạt động là bắt buộc"},{status:403}); const {data,error}=await createAdminClient().from("market_snapshots").select("payload").order("published_at",{ascending:false}).limit(1).maybeSingle(); if(error)return NextResponse.json({error:error.message},{status:500}); return NextResponse.json(data?.payload??{published_at:null,shop_count:0,item_count:0,shops:[]}); }
