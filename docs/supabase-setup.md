# Supabase setup

1. Create a Supabase project through the Vercel Marketplace or Supabase dashboard.
2. Apply `supabase/migrations/202611090001_subscription_foundation.sql` in the SQL editor.
3. Configure the variables from `.env.example` in Vercel.
4. Register the production URL and `/auth/confirm` redirect URL in Supabase Auth.
5. Sign in once, then promote the first administrator in SQL:

```sql
update public.profiles set role='admin' where email='owner@example.com';
```

Never expose `SUPABASE_SERVICE_ROLE_KEY` to browser code or desktop builds.
