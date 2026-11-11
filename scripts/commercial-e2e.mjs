import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { createHash, randomBytes } from "node:crypto";

const required = (name) => { const value = process.env[name]; if (!value) throw new Error(`Missing ${name}`); return value; };
const supabaseUrl = required("NEXT_PUBLIC_SUPABASE_URL");
const publishableKey = required("NEXT_PUBLIC_SUPABASE_ANON_KEY");
const secretKey = required("SUPABASE_SERVICE_ROLE_KEY");
const hostedUrl = required("KHT_E2E_HOSTED_URL").replace(/\/$/, "");
const ingestSecret = required("KHT_MARKET_INGEST_SECRET");
const admin = createClient(supabaseUrl, secretKey, { auth: { persistSession: false, autoRefreshToken: false } });
const email = `kht1.password.${Date.now()}@gmail.com`;
const password = `Kht1-${randomBytes(12).toString("hex")}!`;
const cookieJar = new Map();
const browser = createServerClient(supabaseUrl, publishableKey, {
  cookies: {
    getAll: () => [...cookieJar].map(([name, value]) => ({ name, value })),
    setAll: (items) => items.forEach(({ name, value }) => value ? cookieJar.set(name, value) : cookieJar.delete(name)),
  },
});
const cookieHeader = () => [...cookieJar].map(([name, value]) => `${name}=${value}`).join("; ");
const json = async (url, options = {}) => {
  const response = await fetch(url, options); const payload = await response.json();
  if (!response.ok) throw new Error(`${response.status} ${payload.error || JSON.stringify(payload)}`); return payload;
};

const { data: signup, error: signupError } = await browser.auth.signUp({ email, password });
if (signupError || !signup.user) throw signupError || new Error("Signup did not return a user");
const { error: confirmError } = await admin.auth.admin.updateUserById(signup.user.id, { email_confirm: true });
if (confirmError) throw confirmError;
await browser.auth.signOut();
const { error: loginError } = await browser.auth.signInWithPassword({ email, password });
if (loginError) throw loginError;

const now = new Date();
const grant = async (plan) => {
  const row = {
    user_id: signup.user.id, plan, status: "active",
    starts_at: new Date(now.getTime() - 60_000).toISOString(),
    expires_at: new Date(now.getTime() + 7 * 86400_000).toISOString(),
    source: "complimentary", note: "commercial password e2e",
  };
  const operation = plan === "market"
    ? admin.from("subscriptions").insert(row)
    : admin.from("subscriptions").update(row).eq("user_id", signup.user.id).neq("status", "revoked");
  const { error } = await operation;
  if (error) throw error;
};
await grant("market");
const marketPage = await fetch(`${hostedUrl}/api/market`, { headers: { cookie: cookieHeader() } });
if (marketPage.status !== 200) throw new Error(`Market subscriber expected 200, got ${marketPage.status}`);
await grant("full");

const verifier = randomBytes(48).toString("base64url");
const challenge = createHash("sha256").update(verifier).digest("base64url");
const state = randomBytes(24).toString("base64url");
const authorization = await json(`${hostedUrl}/api/desktop/authorize`, {
  method: "POST", headers: { "content-type": "application/json", cookie: cookieHeader() },
  body: JSON.stringify({ callback: "http://127.0.0.1:49152/auth/callback", challenge, state }),
});
const callback = new URL(authorization.redirect_to);
if (callback.searchParams.get("state") !== state) throw new Error("Desktop state mismatch");
const code = callback.searchParams.get("code");
const token = await json(`${hostedUrl}/api/desktop/token`, {
  method: "POST", headers: { "content-type": "application/json" },
  body: JSON.stringify({ code, verifier, device_id_hash: createHash("sha256").update("e2e-device").digest("hex") }),
});
const publishedAt = new Date(Date.now() + 1000).toISOString();
await json(`${hostedUrl}/api/admin/market-ingest`, {
  method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${ingestSecret}` },
  body: JSON.stringify({ published_at: publishedAt, shop_count: 0, item_count: 0, shops: [] }),
});
const hostedMarket = await json(`${hostedUrl}/api/market`, { headers: { cookie: cookieHeader() } });
const desktopMarket = await json(`${hostedUrl}/api/desktop/market`, { headers: { authorization: `Bearer ${token.access_token}` } });
let replayStatus = 0;
try { await json(`${hostedUrl}/api/desktop/token`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ code, verifier, device_id_hash: "replay" }) }); }
catch (error) { replayStatus = Number(String(error.message).split(" ")[0]); }
if (hostedMarket.published_at !== publishedAt || desktopMarket.published_at !== publishedAt || replayStatus !== 400) throw new Error("E2E invariants failed");
console.log(JSON.stringify({ ok: true, password_signup: true, password_login: true, market_plan_web: true, full_desktop_pkce: true, publication_visible_on_web: true, publication_visible_on_desktop: true, replay_rejected: true }));
