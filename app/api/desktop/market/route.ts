import { NextRequest, NextResponse } from "next/server";
import { resolveDesktopSession } from "@/lib/desktop-session";
import { evaluateEntitlement } from "@/lib/entitlements";
import { createAdminClient } from "@/lib/supabase/admin";
import { publicMarketServer, resolveMarketServer, type MarketServer } from "@/lib/market-servers";

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
  const { data: serverRows, error: serverError } = await db.from("market_servers")
    .select("slug,code,name,is_active,is_default,display_order")
    .eq("is_active", true)
    .order("display_order");
  if (serverError) return NextResponse.json({ error: serverError.message }, { status: 500 });
  let server;
  try {
    server = resolveMarketServer((serverRows ?? []) as MarketServer[], request.nextUrl.searchParams.get("server"));
  } catch (reason) {
    return NextResponse.json({ error: reason instanceof Error ? reason.message : "Chưa cấu hình máy chủ" }, { status: 503 });
  }
  const { data, error } = await db.from("market_snapshots")
    .select("payload")
    .eq("server_slug", server.slug)
    .order("published_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({...(data?.payload ?? EMPTY_MARKET),server:publicMarketServer(server),servers:(serverRows??[]).map(row=>publicMarketServer(row as MarketServer))});
}
