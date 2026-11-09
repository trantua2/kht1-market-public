import { createClient } from "@/lib/supabase/server";
import { evaluateEntitlement } from "@/lib/entitlements";
export async function currentEntitlement(){ const supabase=await createClient(); const {data:{user}}=await supabase.auth.getUser(); if(!user)return {user:null,entitlement:evaluateEntitlement(null)}; const {data}=await supabase.from("subscriptions").select("plan,status,starts_at,expires_at").eq("user_id",user.id).neq("status","revoked").maybeSingle(); return {user,entitlement:evaluateEntitlement(data as never)}; }
