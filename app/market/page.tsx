import { redirect } from "next/navigation";
import { MarketClient } from "@/components/market-client";
import { currentEntitlement } from "@/lib/current-entitlement";
export default async function Market(){const {user,entitlement}=await currentEntitlement();if(!user)redirect("/login?next=/market");return entitlement.features.includes("market.read")?<MarketClient/>:<main className="market-shell"><div className="panel"><h1>Chưa có subscription</h1><p>Hãy liên hệ quản trị viên để kích hoạt gói Market hoặc Full.</p></div></main>}
