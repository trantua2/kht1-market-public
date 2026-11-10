# Public Trailer and Market Server Segmentation Design

## Goal

Make the service understandable before sign-in and partition market data by game server. A paid subscription belongs to the user account and grants access to every supported server. Existing production data belongs to `S7 – Cửu Long`.

## Scope

This change covers:

- a public landing page at `/` that explains the product before login;
- a server catalogue and server-aware market snapshots;
- server selection inside the paid market;
- publication of snapshots with an explicit server identity;
- migration of all existing snapshots to `S7 – Cửu Long`.

It does not introduce per-server pricing, a public live-data preview, or automatic discovery of a game server from shop payloads.

## Product Rules

- Subscriptions remain account-level. Any active market subscription can read every active server.
- The initial and default server is `s7-cuu-long`, displayed as `S7 – Cửu Long`.
- A user can change server from the market toolbar. City, item and option filters apply only within the selected server.
- If a requested server is missing or inactive, the API falls back to the default active server.
- Adding a future server must only require a catalogue row and publishing snapshots with that server's slug.

## Public Landing Page

The root route no longer redirects directly to `/market`. It becomes a compact, responsive sales page using the existing nostalgic martial-arts visual language.

The page contains:

1. A hero with the value proposition: find the right item, stall, city and coordinates without manually checking every shop.
2. Two primary actions: `Xem bảng giá` and `Đăng nhập`.
3. A static interactive-looking market demonstration showing server selection, representative filters and synthetic item results. It must not call the protected market API or expose production shop data.
4. A three-step explanation: choose server, filter the item, go to the matching stall.
5. A supported-server section showing `S7 – Cửu Long` and making clear that more servers can be added.
6. A concise feature summary covering item names, prices, attributes, city, stall owner and coordinates.

The navigation remains consistent with the current market, pricing and account pages. Signed-in users may still use the landing page; calls to action should take them directly to `/market` or `/pricing` as appropriate.

## Data Model

Create `market_servers` with:

- `slug text primary key`;
- `code text not null`;
- `name text not null`;
- `is_active boolean not null default true`;
- `is_default boolean not null default false`;
- `display_order integer not null default 0`;
- timestamps.

Seed one row: `s7-cuu-long`, `S7`, `Cửu Long`, active and default.

Add `server_slug text not null` to `market_snapshots`, referencing `market_servers(slug)`. During migration, existing snapshot rows receive `s7-cuu-long` before the column becomes non-null. Add an index on `(server_slug, published_at desc)` so the latest snapshot lookup stays fast.

Server catalogue reads are public metadata. Snapshot payloads remain inaccessible through Supabase RLS and are returned only through authenticated application APIs.

## Publish Contract

Every published snapshot includes a top-level server object:

```json
{
  "server": {
    "slug": "s7-cuu-long",
    "code": "S7",
    "name": "Cửu Long"
  }
}
```

The ingest endpoint validates the server slug against the active catalogue, then writes both `server_slug` and the full payload. It rejects unknown or inactive servers instead of silently assigning data to S7.

The admin scanner uses explicit local configuration for the publishing server. The initial default is S7 for backward compatibility, but server identity must not be inferred from internal game IDs contained in shop observations.

## Market API and UI

`GET /api/market` accepts `server`. It resolves the server, loads only that server's newest snapshot, applies the existing filters and returns:

- the resolved server;
- all active server choices;
- existing result counts, filters, shops and pagination data.

Pagination requests carry the same server slug. Changing server resets the cursor and reloads all filters against the selected server. The UI places the server selector before the city selector and labels the market masthead with the active server.

The desktop market API also accepts a server slug and uses the same resolution rules so web and desktop cannot diverge later.

## Empty and Failure States

- An active server with no snapshot returns an empty market response with the server identity, not a generic server error.
- Unknown or inactive server requests fall back to the default active server.
- If no active default exists, APIs return a clear configuration error.
- Ingest rejects malformed server metadata, unknown slugs and mismatched catalogue code/name.
- The landing-page demo remains usable if Supabase or the market API is unavailable because it uses synthetic data.

## Security and Data Exposure

- The trailer contains no real owner, coordinates, prices or live snapshot payloads.
- Public server metadata is safe to expose; paid market data continues to require `market.read`.
- Server selection is enforced in the API query, not only in the browser.
- The ingest secret and Supabase service credentials remain server-only.

## Verification

Automated tests cover:

- server metadata validation and default resolution;
- ingest persistence under the correct server;
- market API selection, fallback and empty-server behavior;
- account-level entitlement working across servers;
- landing page content and absence of protected API calls;
- server selector query and pagination behavior;
- migration shape and S7 backfill contract.

Final verification runs the full Vitest suite, TypeScript type-check and production build. A browser smoke check covers `/`, `/login`, `/pricing`, and switching server on `/market` with an entitled account.
