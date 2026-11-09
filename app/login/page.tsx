import { LoginForm } from "@/components/login-form";
import { safeNextPath } from "@/lib/auth";
export default async function Login({searchParams}:{searchParams:Promise<{next?:string}>}) { const p=await searchParams; return <main className="shell"><h1>Đăng nhập</h1><p>Dùng email để nhận liên kết đăng nhập một lần.</p><LoginForm nextPath={safeNextPath(p.next)}/></main>; }
