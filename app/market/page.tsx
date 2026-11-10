import { redirect } from "next/navigation";
import Link from "next/link";
import { MarketClient } from "@/components/market-client";
import { PricingCards } from "@/components/pricing-cards";
import { BILLING_PRODUCTS } from "@/lib/billing-products";
import { currentEntitlement } from "@/lib/current-entitlement";
export default async function Market(){const {user,entitlement}=await currentEntitlement();if(!user)redirect("/login?next=/market");if(entitlement.features.includes("market.read"))return <MarketClient/>;return <main className="shell pricing-page"><nav className="account-nav"><Link href="/account">Tài khoản</Link></nav><p className="eyebrow">KHT1 FULL</p><h1>Chọn thời hạn sử dụng</h1><PricingCards products={BILLING_PRODUCTS} signedIn={true}/></main>}
