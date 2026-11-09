import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { challengeForVerifier, hashOpaqueToken, newOpaqueToken } from "@/lib/desktop-auth";

export async function POST(request:NextRequest) {
  const {code,verifier,device_id_hash} = await request.json();
  if (typeof code!=="string" || typeof verifier!=="string") return NextResponse.json({error:"Yêu cầu không hợp lệ"},{status:400});
  const db=createAdminClient();
  const {data:row}=await db.from("desktop_auth_codes").select("id,user_id,pkce_challenge,expires_at,consumed_at").eq("code_hash",hashOpaqueToken(code)).maybeSingle();
  if(!row || row.consumed_at || new Date(row.expires_at)<=new Date() || challengeForVerifier(verifier)!==row.pkce_challenge) return NextResponse.json({error:"Mã đăng nhập không hợp lệ hoặc đã hết hạn"},{status:400});
  const token=newOpaqueToken(48), expiresAt=new Date(Date.now()+30*24*60*60_000).toISOString();
  const {error:sessionError}=await db.from("desktop_sessions").insert({user_id:row.user_id,token_hash:hashOpaqueToken(token),device_id_hash:typeof device_id_hash==="string"?device_id_hash:null,expires_at:expiresAt});
  if(sessionError)return NextResponse.json({error:sessionError.message},{status:500});
  await db.from("desktop_auth_codes").update({consumed_at:new Date().toISOString()}).eq("id",row.id).is("consumed_at",null);
  return NextResponse.json({access_token:token,expires_at:expiresAt,token_type:"Bearer"});
}
