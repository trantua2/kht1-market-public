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
    if(body.action==="create_user"){
      const email=String(body.email??"").trim().toLowerCase(),password=String(body.password??"");
      if(!email.includes("@"))throw new Error("Email không hợp lệ");
      if(password.length<8)throw new Error("Mật khẩu phải có ít nhất 8 ký tự");
      const {data,error}=await db.auth.admin.createUser({email,password,email_confirm:true});
      if(error)throw error;
      return NextResponse.json({ok:true,user:{id:data.user.id,email:data.user.email}});
    }
    if(body.action==="delete_user"){
      if(typeof body.user_id!=="string")throw new Error("User không hợp lệ");
      const {data:ownedSubscriptions,error:ownedSubscriptionsError}=await db.from("subscriptions").select("id").eq("user_id",body.user_id);
      if(ownedSubscriptionsError)throw ownedSubscriptionsError;
      const subscriptionIds=(ownedSubscriptions??[]).map(subscription=>subscription.id);
      if(subscriptionIds.length){
        const {error:subscriptionEventReferenceError}=await db.from("subscription_events").update({subscription_id:null}).in("subscription_id",subscriptionIds);
        if(subscriptionEventReferenceError)throw subscriptionEventReferenceError;
      }
      const {error:subscriptionReferenceError}=await db.from("subscriptions").update({created_by:null}).eq("created_by",body.user_id);
      if(subscriptionReferenceError)throw subscriptionReferenceError;
      const {error:eventReferenceError}=await db.from("subscription_events").update({performed_by:null}).eq("performed_by",body.user_id);
      if(eventReferenceError)throw eventReferenceError;
      const {error}=await db.auth.admin.deleteUser(body.user_id);
      if(error)throw error;
      return NextResponse.json({ok:true});
    }
    if(body.action==="update_user"){
      if(typeof body.user_id!=="string"||!ROLES.includes(body.role))throw new Error("Role không hợp lệ");
      if(!PLANS.includes(body.plan)||!STATUSES.includes(body.status))throw new Error("Subscription không hợp lệ");
      const days=Number(body.days);
      if(!Number.isInteger(days)||days<1||days>3650)throw new Error("Số ngày phải từ 1 đến 3650");
      const {error:roleError}=await db.from("profiles").update({role:body.role}).eq("id",body.user_id);
      if(roleError)throw roleError;
      const {data:current,error:readError}=await db.from("subscriptions").select("*").eq("user_id",body.user_id).neq("status","revoked").maybeSingle();
      if(readError)throw readError;
      const now=new Date(),expiresAt=calculateExtension(current?.expires_at,days,now).toISOString();
      const values={user_id:body.user_id,plan:body.plan,status:body.status,starts_at:current?.starts_at??now.toISOString(),expires_at:expiresAt,source:"manual" as const,note:String(body.note??"").slice(0,500),updated_at:now.toISOString()};
      const query=current?db.from("subscriptions").update(values).eq("id",current.id):db.from("subscriptions").insert(values);
      const {data,error}=await query.select("*").single();
      if(error)throw error;
      await db.from("subscription_events").insert({user_id:body.user_id,subscription_id:data.id,action:current?"update":"grant",previous_value:current,new_value:data});
      return NextResponse.json({ok:true,subscription:data,role:body.role});
    }
    throw new Error("Action không hợp lệ");
  }catch(error){return NextResponse.json({error:error instanceof Error?error.message:"Invalid request"},{status:400})}
}
