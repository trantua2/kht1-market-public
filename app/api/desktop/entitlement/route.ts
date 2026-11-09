import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { evaluateEntitlement } from "@/lib/entitlements";
import { resolveDesktopSession } from "@/lib/desktop-session";

export async function GET(request:NextRequest){
  const session=await resolveDesktopSession(request.headers.get("authorization"));
  if(!session)return NextResponse.json({error:"Phiên desktop đã hết hạn"},{status:401});
  const db=createAdminClient();
  const {data:subscription}=await db.from("subscriptions").select("plan,status,starts_at,expires_at").eq("user_id",session.user_id).neq("status","revoked").maybeSingle();
  return NextResponse.json(evaluateEntitlement(subscription as never));
}
