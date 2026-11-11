import Link from "next/link";
import {redirect} from "next/navigation";
import {currentEntitlement} from "@/lib/current-entitlement";
import {hasMarketAccess,planLabel,statusLabel} from "@/lib/membership-display";
import {SiteHeader} from "@/components/site-header";
import {SiteFooter} from "@/components/site-footer";

export default async function Account(){
  const {user,entitlement}=await currentEntitlement();
  if(!user)redirect("/login?next=/account");
  const hasAccess=hasMarketAccess(entitlement.features);
  return <main className="shell account-page"><SiteHeader signedIn hasAccess={hasAccess}/><section className="page-intro"><p className="eyebrow">HỒ SƠ HỘI VIÊN</p><h1>Tài khoản</h1></section><section className="membership-record"><div className="record-seal">K1</div><dl><div><dt>Email</dt><dd>{user.email}</dd></div><div><dt>Gói</dt><dd>{planLabel(entitlement.plan)}</dd></div><div><dt>Trạng thái</dt><dd>{statusLabel(entitlement.status)}</dd></div><div><dt>Hết hạn</dt><dd>{entitlement.expires_at?new Date(entitlement.expires_at).toLocaleString("vi-VN"):"—"}</dd></div></dl>{!hasAccess&&<Link prefetch className="primary-link" href="/pricing">Đăng ký gói</Link>}</section><SiteFooter/></main>;
}
