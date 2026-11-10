import Link from "next/link";
import {BILLING_PRODUCTS} from "@/lib/billing-products";
import {PricingCards} from "@/components/pricing-cards";
import {currentEntitlement} from "@/lib/current-entitlement";

export default async function Pricing(){
  const {user,entitlement}=await currentEntitlement();
  return <main className="shell pricing-page"><nav className="account-nav"><Link href="/market">Sản phẩm</Link><Link href="/account">Tài khoản</Link></nav><p className="eyebrow">KHT1 FULL</p><h1>Chọn thời hạn sử dụng</h1><p className="subtitle">Thanh toán một lần bằng VietQR. Không tự động gia hạn hay trừ tiền.</p>
    {user&&<div className="card"><strong>{user.email}</strong><p>Gói hiện tại: {entitlement.plan??"Chưa có"} · {entitlement.expires_at?`hết hạn ${new Date(entitlement.expires_at).toLocaleString("vi-VN")}`:"chưa có thời hạn"}</p></div>}
    <PricingCards products={BILLING_PRODUCTS} signedIn={Boolean(user)}/><p className="hint">Thời hạn được cộng tự động sau khi ngân hàng xác nhận giao dịch.</p>
  </main>;
}
