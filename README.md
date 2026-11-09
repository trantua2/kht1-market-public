# KHT1 Market subscription web

Next.js application deployed on Vercel with Supabase Auth and Postgres.

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

## Verification

```bash
npm test
npm run typecheck
npm run build
```
