import { PasswordAuthForm } from "@/components/password-auth-form";
import { safeNextPath } from "@/lib/auth";
export default async function Login({searchParams}:{searchParams:Promise<{next?:string}>}) { const p=await searchParams; return <main className="shell"><h1>Tài khoản KHT1</h1><p>Đăng nhập hoặc đăng ký bằng email và mật khẩu.</p><PasswordAuthForm nextPath={safeNextPath(p.next)}/></main>; }
