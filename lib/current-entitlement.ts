import { createClient } from "@/lib/supabase/server";
import { evaluateEntitlement } from "@/lib/entitlements";
export async function currentEntitlement(){
  const supabase=await createClient();
  const {data}=await supabase.auth.getClaims();
  const claims=data?.claims;
  const user=claims?.sub?{id:claims.sub,email:typeof claims.email==="string"?claims.email:undefined}:null;
  if(!user)return {user:null,entitlement:evaluateEntitlement(null)};
  const {data:subscription}=await supabase.from("subscriptions").select("plan,status,starts_at,expires_at").eq("user_id",user.id).neq("status","revoked").maybeSingle();
  return {user,entitlement:evaluateEntitlement(subscription as never)};
}
