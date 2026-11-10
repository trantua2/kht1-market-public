import { redirect } from "next/navigation";
import { MarketClient } from "@/components/market-client";
import { PricingCards } from "@/components/pricing-cards";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { BILLING_PRODUCTS } from "@/lib/billing-products";
import { currentEntitlement } from "@/lib/current-entitlement";
export default async function Market(){const {user,entitlement}=await currentEntitlement();if(!user)redirect("/login?next=/market");if(entitlement.features.includes("market.read"))return <MarketClient/>;return <main className="shell pricing-page"><SiteHeader signedIn/><section className="page-intro"><p className="eyebrow">KHT1 FULL</p><h1>Mở cửa chợ giang hồ</h1><p className="subtitle">Chọn thời hạn để xem toàn bộ vật phẩm.</p></section><PricingCards products={BILLING_PRODUCTS} signedIn/><SiteFooter/></main>}
