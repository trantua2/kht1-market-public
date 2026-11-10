"use client";

import Link from "next/link";
import {createClient} from "@/lib/supabase/browser";

export function SiteHeader({signedIn=false}:{signedIn?:boolean}){
  async function signOut(){await createClient().auth.signOut();location.href="/login"}
  return <header className="site-header">
    <Link className="site-brand" href="/market"><span className="brand-seal">俠</span><span><b>KHT1 Market</b><small>Kiếm Hiệp Tình 1 · Sabo</small></span></Link>
    <nav className="site-nav" aria-label="Điều hướng chính">
      <Link href="/market">Sản phẩm</Link><Link href="/pricing">Bảng giá</Link><Link href="/account">Tài khoản</Link>
      {signedIn&&<button type="button" onClick={signOut}>Đăng xuất</button>}
    </nav>
  </header>;
}
