import { createClient } from "@/lib/supabase/server";
export function isAdminRole(role:unknown):role is "admin"{return role==="admin"}
export async function requireAdmin(){const supabase=await createClient();const {data:{user}}=await supabase.auth.getUser();if(!user)return null;const {data}=await supabase.from("profiles").select("role").eq("id",user.id).single();return isAdminRole(data?.role)?user:null}
