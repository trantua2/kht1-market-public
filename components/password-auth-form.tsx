"use client";

import { FormEvent, useState } from "react";
import { parseCredentials } from "@/lib/password-auth";
import { createClient } from "@/lib/supabase/browser";

type Mode = "login" | "register";

export function PasswordAuthForm({ nextPath }: { nextPath: string }) {
  const [mode, setMode] = useState<Mode>("login");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const form = new FormData(event.currentTarget);
      const input = parseCredentials({ email: form.get("email"), password: form.get("password") });
      const supabase = createClient();
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword(input);
        if (error) throw error;
        location.href = nextPath;
        return;
      }
      const { data, error } = await supabase.auth.signUp({
        ...input,
        options: { emailRedirectTo: `${location.origin}/auth/confirm?next=${encodeURIComponent(nextPath)}` },
      });
      if (error) throw error;
      if (data.session) location.href = nextPath;
      else setMessage("Đăng ký thành công. Hãy kiểm tra email để xác minh tài khoản.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Không thể xác thực tài khoản.");
    } finally {
      setBusy(false);
    }
  }

  return <div className="auth-card">
    <div className="auth-modes">
      <button type="button" className={mode === "login" ? "active" : ""} onClick={() => { setMode("login"); setMessage(""); }}>Đăng nhập</button>
      <button type="button" className={mode === "register" ? "active" : ""} onClick={() => { setMode("register"); setMessage(""); }}>Đăng ký</button>
    </div>
    <form className="editorial-form" onSubmit={submit}>
      <label>Email<input name="email" type="email" placeholder="ten@email.com" required autoComplete="email" /></label>
      <label>Mật khẩu<input name="password" type="password" placeholder="Tối thiểu 8 ký tự" minLength={8} maxLength={128} required autoComplete={mode === "login" ? "current-password" : "new-password"} /></label>
      <button className="auth-submit" disabled={busy}>{busy ? "Đang xử lý…" : mode === "login" ? "Đăng nhập" : "Tạo tài khoản"}</button>
      <p className={`auth-message ${message && !message.includes("thành công") ? "error" : ""}`} aria-live="polite">{message || "\u00a0"}</p>
    </form>
  </div>;
}
