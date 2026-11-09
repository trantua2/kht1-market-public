import { PasswordAuthForm } from "@/components/password-auth-form";
import { safeNextPath } from "@/lib/auth";
export default async function Login({searchParams}:{searchParams:Promise<{next?:string}>}) {
  const params = await searchParams;
  return <main className="auth-page">
    <section className="auth-shell">
      <header className="auth-brand">
        <span className="auth-mark">K1</span>
        <div><p>KIẾM HIỆP TÌNH 1</p><h1>KHT1 Market</h1></div>
      </header>
      <p className="auth-intro">Đăng nhập để xem sản phẩm và kết nối công cụ desktop.</p>
      <PasswordAuthForm nextPath={safeNextPath(params.next)} />
      <p className="auth-footnote">Tài khoản được bảo vệ bởi Supabase Auth.</p>
    </section>
  </main>;
}
