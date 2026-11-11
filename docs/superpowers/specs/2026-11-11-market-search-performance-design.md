# Market Search Performance Design

## Goal

Reduce warm filter/search latency without exposing complete paid snapshots to the browser or weakening entitlement checks.

## Design

- Add a server-only market data cache with separate entries for the active server catalogue and each server's latest snapshot.
- Cache the catalogue for five minutes and snapshots for thirty seconds.
- Coalesce concurrent cache misses so one Vercel instance performs only one Supabase query per key.
- Bound snapshot cache size and remove expired entries to avoid unbounded memory growth.
- Invalidate the affected snapshot immediately after a successful ingest. Invalidation is process-local; the short TTL covers other serverless instances.
- Start rate-limit verification and cached market loading concurrently after authentication. Never return market data before the rate-limit result allows it.
- Keep filtering server-side. The current projection costs roughly 20ms and does not justify sending the 1.75MB snapshot to clients.
- Reduce the client debounce from 280ms to 180ms and keep aborting stale requests.

## Verification

- Unit tests cover cache hits, TTL expiry, request coalescing, bounded entries and invalidation.
- Route tests assert cached loaders and concurrent rate-limit/data loading are used.
- UI tests assert the shorter debounce and stale-request cancellation remain active.
- Full tests, typecheck and production build must pass before deployment.
