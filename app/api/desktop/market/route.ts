import { NextRequest, NextResponse } from "next/server";
import { resolveDesktopSession } from "@/lib/desktop-session";
import { evaluateEntitlement } from "@/lib/entitlements";
import { createAdminClient } from "@/lib/supabase/admin";

const EMPTY_MARKET = { published_at: null, shop_count: 0, item_count: 0, shops: [] };

export async function GET(request: NextRequest) {
  const session = await resolveDesktopSession(request.headers.get("authorization"));
  if (!session) return NextResponse.json({ error: "Phiên desktop đã hết hạn" }, { status: 401 });
  const db = createAdminClient();
  const { data: subscription } = await db.from("subscriptions")
    .select("plan,status,starts_at,expires_at")
    .eq("user_id", session.user_id)
    .neq("status", "revoked")
    .maybeSingle();
  const entitlement = evaluateEntitlement(subscription as never);
  if (entitlement.plan !== "full" || !entitlement.features.includes("market.read")) {
    return NextResponse.json({ error: "Gói Plus đang hoạt động là bắt buộc" }, { status: 403 });
  }
  const { data, error } = await db.from("market_snapshots")
    .select("payload")
    .order("published_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data?.payload ?? EMPTY_MARKET);
}
