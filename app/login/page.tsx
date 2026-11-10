import { PasswordAuthForm } from "@/components/password-auth-form";
import { safeNextPath } from "@/lib/auth";
export default async function Login({searchParams}:{searchParams:Promise<{next?:string}>}) {
  const params = await searchParams;
  return <main className="auth-page">
    <section className="auth-shell">
      <header className="auth-brand">
        <span className="auth-mark">俠</span>
        <div><p>KIẾM HIỆP TÌNH 1 · SABO</p><h1>KHT1 Market</h1></div>
      </header>
      <div className="ornamental-rule"><span>◆</span></div><p className="auth-intro">Đăng nhập để vào chợ giang hồ.</p>
      <PasswordAuthForm nextPath={safeNextPath(params.next)} />
      <p className="auth-footnote">Một tài khoản dùng cho web và KHT1 Tool.</p>
    </section>
  </main>;
}
