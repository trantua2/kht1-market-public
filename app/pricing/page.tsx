import {redirect} from "next/navigation";
import {BILLING_PRODUCTS} from "@/lib/billing-products";
import {PricingCards} from "@/components/pricing-cards";
import {SiteFooter} from "@/components/site-footer";
import {SiteHeader} from "@/components/site-header";
import {currentEntitlement} from "@/lib/current-entitlement";
import {planLabel,statusLabel} from "@/lib/membership-display";

export default async function Pricing(){
  const {user,entitlement}=await currentEntitlement();
  if(entitlement.plan==="full")redirect("/account");
  const products=entitlement.plan==="market"?BILLING_PRODUCTS.filter(product=>product.plan==="full"):BILLING_PRODUCTS;
  return <main className="shell pricing-page"><SiteHeader signedIn={Boolean(user)}/><section className="page-intro"><p className="eyebrow">NORMAL & PLUS</p><h1>{entitlement.plan==="market"?"Nâng cấp Plus":"Chọn thời hạn sử dụng"}</h1><p className="subtitle">Thanh toán một lần bằng VietQR. Không tự động gia hạn.</p></section>
    {user&&<div className="membership-strip"><strong>{user.email}</strong><span>{planLabel(entitlement.plan)} · {statusLabel(entitlement.status)}{entitlement.expires_at?` · hết hạn ${new Date(entitlement.expires_at).toLocaleString("vi-VN")}`:""}</span></div>}
    <PricingCards products={products} signedIn={Boolean(user)}/><p className="hint pricing-note">Thời hạn được cộng sau khi ngân hàng xác nhận.</p><SiteFooter/>
  </main>;
}
