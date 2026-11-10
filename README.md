# KHT1 Market subscription web

Next.js commercial application with Supabase email/password Auth and Postgres.

## Local setup

```bash
cp .env.example .env.local
npm install
npm run dev
```

Apply the SQL migration and follow [Supabase setup](docs/supabase-setup.md).
The paid market snapshot is never committed or served as a static JSON file.
Publish data through `POST /api/admin/market-ingest` with the configured bearer
secret.

The desktop app starts login at `/desktop/connect` with a loopback callback,
PKCE challenge, and random state. `/api/desktop/token` consumes the short-lived
authorization code once; `/api/desktop/entitlement` resolves the current live
subscription for privileged local operations. Never expose the Supabase service
role key or ingestion secret in the desktop package.

Customers register and sign in with email and password. Magic links are not the
normal login mechanism; email links are reserved for verification and password
recovery. Full desktop sessions read published items from
`GET /api/desktop/market`.

## One-time payments with payOS

`/pricing` offers four Full packages: 3 days/5,000 VND, 7 days/10,000 VND,
15 days/20,000 VND, and 30 days/35,000 VND. These are one-time payments and do
not automatically renew or charge the customer again.

Apply `supabase/migrations/202611100001_one_time_payments.sql`, then configure
these server-only environment variables:

```bash
PAYOS_CLIENT_ID=
PAYOS_API_KEY=
PAYOS_CHECKSUM_KEY=
```

Configure the payOS webhook as
`https://<domain>/api/billing/payos/webhook`. Only a webhook with a valid HMAC
can invoke the database function that adds time. The payment return URL never
grants access. The function locks each order and treats an already-paid order
as idempotent, so webhook retries cannot add the duration twice.

## Verification

```bash
npm test
npm run typecheck
npm run build
```
