import { redirect } from "next/navigation";
import { MarketClient } from "@/components/market-client";
import { currentEntitlement } from "@/lib/current-entitlement";
export default async function Market(){const {user,entitlement}=await currentEntitlement();if(!user)redirect("/login?next=/market");return <main className="shell"><h1>Danh sách sản phẩm</h1>{entitlement.features.includes("market.read")?<MarketClient/>:<div className="card"><h2>Chưa có subscription</h2><p>Hãy liên hệ quản trị viên để kích hoạt gói Market hoặc Full.</p></div>}</main>}
