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

## Verification

```bash
npm test
npm run typecheck
npm run build
```
