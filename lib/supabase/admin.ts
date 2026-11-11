import { createClient } from "@supabase/supabase-js";
import { requiredEnv } from "@/lib/config";
export function createAdminClient(){ return createClient(requiredEnv("NEXT_PUBLIC_SUPABASE_URL"),requiredEnv("SUPABASE_SERVICE_ROLE_KEY"),{auth:{persistSession:false,autoRefreshToken:false}}); }
