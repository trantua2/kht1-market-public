import {BILLING_PRODUCTS} from "@/lib/billing-products";
import {PricingCards} from "@/components/pricing-cards";
import {SiteFooter} from "@/components/site-footer";
import {SiteHeader} from "@/components/site-header";
import {currentEntitlement} from "@/lib/current-entitlement";

export default async function Pricing(){
  const {user,entitlement}=await currentEntitlement();
  return <main className="shell pricing-page"><SiteHeader signedIn={Boolean(user)}/><section className="page-intro"><p className="eyebrow">KHT1 FULL</p><h1>Chọn thời hạn sử dụng</h1><p className="subtitle">Thanh toán một lần bằng VietQR. Không tự động gia hạn.</p></section>
    {user&&<div className="membership-strip"><strong>{user.email}</strong><span>{entitlement.plan??"Chưa có gói"} · {entitlement.expires_at?`hết hạn ${new Date(entitlement.expires_at).toLocaleString("vi-VN")}`:"chưa có thời hạn"}</span></div>}
    <PricingCards products={BILLING_PRODUCTS} signedIn={Boolean(user)}/><p className="hint pricing-note">Thời hạn được cộng sau khi ngân hàng xác nhận.</p><SiteFooter/>
  </main>;
}
