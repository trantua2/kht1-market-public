"use client";
import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/browser";

export function LoginForm({ nextPath }: { nextPath: string }) {
  const [message,setMessage]=useState(""); const [busy,setBusy]=useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setBusy(true); const email=String(new FormData(event.currentTarget).get("email")||""); const redirectTo=`${location.origin}/auth/confirm?next=${encodeURIComponent(nextPath)}`; const {error}=await createClient().auth.signInWithOtp({email,options:{emailRedirectTo:redirectTo}}); setMessage(error?.message||"Đã gửi liên kết đăng nhập. Hãy kiểm tra email."); setBusy(false); }
  return <form onSubmit={submit} className="card"><label>Email<input name="email" type="email" required autoComplete="email" /></label><button disabled={busy}>{busy?"Đang gửi…":"Gửi liên kết đăng nhập"}</button><p>{message}</p></form>;
}
