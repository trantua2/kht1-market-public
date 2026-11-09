import { createAdminClient } from "@/lib/supabase/admin";
import { hashOpaqueToken } from "@/lib/desktop-auth";

export type DesktopSession = { id: string; user_id: string };

export function readBearerToken(authorization: string | null): string | null {
  const match = authorization?.match(/^Bearer\s+(\S+)$/i);
  return match?.[1] ?? null;
}

export async function resolveDesktopSession(authorization: string | null): Promise<DesktopSession | null> {
  const token = readBearerToken(authorization);
  if (!token) return null;
  const db = createAdminClient();
  const { data } = await db.from("desktop_sessions")
    .select("id,user_id,expires_at,revoked_at")
    .eq("token_hash", hashOpaqueToken(token))
    .maybeSingle();
  if (!data || data.revoked_at || new Date(data.expires_at) <= new Date()) return null;
  await db.from("desktop_sessions").update({ last_seen_at: new Date().toISOString() }).eq("id", data.id);
  return { id: data.id, user_id: data.user_id };
}
