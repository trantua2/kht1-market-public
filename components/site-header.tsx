"use client";

import Link from "next/link";
import {createClient} from "@/lib/supabase/browser";

export function SiteHeader({signedIn=false,hasAccess=false}:{signedIn?:boolean;hasAccess?:boolean}){
  async function signOut(){await createClient().auth.signOut();location.href="/login"}
  return <header className="site-header">
    <Link prefetch className="site-brand" href="/"><span className="brand-seal">俠</span><span><b>KHT1 Market</b><small>Kiếm Hiệp Tình 1</small></span></Link>
    <nav className="site-nav" aria-label="Điều hướng chính">
      <Link prefetch href="/market">Sản phẩm</Link>{!hasAccess&&<Link prefetch href="/pricing">Bảng giá</Link>}{signedIn?<Link prefetch href="/account">Tài khoản</Link>:<Link prefetch href="/login?next=/market">Đăng nhập</Link>}
      {signedIn&&<button type="button" onClick={signOut}>Đăng xuất</button>}
    </nav>
  </header>;
}
