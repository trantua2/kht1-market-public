import { NextRequest,NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireInternalSecret } from "@/lib/internal-auth";
import { calculateExtension } from "@/lib/subscription-input";

const ROLES=["user","admin"] as const;
const PLANS=["market","full"] as const;
const STATUSES=["active","paused","revoked","expired"] as const;

export async function GET(request:NextRequest){
  if(!requireInternalSecret(request))return NextResponse.json({error:"Unauthorized"},{status:401});
  const {data,error}=await createAdminClient().from("profiles").select("id,email,display_name,role,created_at,subscriptions!subscriptions_user_id_fkey(id,plan,status,starts_at,expires_at,source,note,updated_at)").order("created_at",{ascending:false});
  if(error)return NextResponse.json({error:error.message},{status:500});
  return NextResponse.json({users:(data??[]).map(user=>({...user,subscription:user.subscriptions?.find(item=>item.status!=="revoked")??user.subscriptions?.[0]??null,subscriptions:undefined}))});
}

export async function POST(request:NextRequest){
  if(!requireInternalSecret(request))return NextResponse.json({error:"Unauthorized"},{status:401});
  try{
    const body=await request.json();
    const db=createAdminClient();
    if(body.action==="set_role"){
      if(typeof body.user_id!=="string"||!ROLES.includes(body.role))throw new Error("Role không hợp lệ");
      const {data,error}=await db.from("profiles").update({role:body.role}).eq("id",body.user_id).select("id,email,role").single();
      if(error)throw error;
      return NextResponse.json({ok:true,user:data});
    }
    if(body.action==="subscription"){
      if(typeof body.user_id!=="string"||!PLANS.includes(body.plan)||!STATUSES.includes(body.status))throw new Error("Subscription không hợp lệ");
      const days=Number(body.days);
      if(!Number.isInteger(days)||days<1||days>3650)throw new Error("Số ngày phải từ 1 đến 3650");
      const {data:current,error:readError}=await db.from("subscriptions").select("*").eq("user_id",body.user_id).neq("status","revoked").maybeSingle();
      if(readError)throw readError;
      const now=new Date(),expiresAt=calculateExtension(current?.expires_at,days,now).toISOString();
      const values={user_id:body.user_id,plan:body.plan,status:body.status,starts_at:current?.starts_at??now.toISOString(),expires_at:expiresAt,source:"manual" as const,note:String(body.note??"").slice(0,500),updated_at:now.toISOString()};
      const query=current?db.from("subscriptions").update(values).eq("id",current.id):db.from("subscriptions").insert(values);
      const {data,error}=await query.select("*").single();
      if(error)throw error;
      await db.from("subscription_events").insert({user_id:body.user_id,subscription_id:data.id,action:current?"update":"grant",previous_value:current,new_value:data});
      return NextResponse.json({ok:true,subscription:data});
    }
    throw new Error("Action không hợp lệ");
  }catch(error){return NextResponse.json({error:error instanceof Error?error.message:"Invalid request"},{status:400})}
}
