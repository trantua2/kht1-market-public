import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { evaluateEntitlement } from "@/lib/entitlements";
import { hashOpaqueToken } from "@/lib/desktop-auth";

export async function GET(request:NextRequest){
  const token=request.headers.get("authorization")?.replace(/^Bearer\s+/i,"")??"";
  if(!token)return NextResponse.json({error:"Unauthorized"},{status:401});
  const db=createAdminClient();
  const {data:session}=await db.from("desktop_sessions").select("id,user_id,expires_at,revoked_at").eq("token_hash",hashOpaqueToken(token)).maybeSingle();
  if(!session||session.revoked_at||new Date(session.expires_at)<=new Date())return NextResponse.json({error:"Phiên desktop đã hết hạn"},{status:401});
  const {data:subscription}=await db.from("subscriptions").select("plan,status,starts_at,expires_at").eq("user_id",session.user_id).neq("status","revoked").maybeSingle();
  await db.from("desktop_sessions").update({last_seen_at:new Date().toISOString()}).eq("id",session.id);
  return NextResponse.json(evaluateEntitlement(subscription as never));
}
