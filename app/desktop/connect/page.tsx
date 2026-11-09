import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DesktopConnect } from "@/components/desktop-connect";

export default async function Connect({searchParams}:{searchParams:Promise<Record<string,string|undefined>>}){
  const params=await searchParams;
  const {data:{user}}=await (await createClient()).auth.getUser();
  const query=new URLSearchParams(Object.entries(params).filter((v):v is [string,string]=>Boolean(v[1])));
  if(!user)redirect(`/login?next=${encodeURIComponent(`/desktop/connect?${query}`)}`);
  return <main className="shell"><h1>Kết nối KHT1 Tool</h1><p>Đăng nhập với {user.email}</p><DesktopConnect callback={params.callback??""} challenge={params.challenge??""} state={params.state??""}/></main>;
}
