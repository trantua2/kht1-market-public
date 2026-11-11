# Plus Market Access Design

## Goal

Add a Plus tier that reveals build-oriented item options while Normal remains useful for Dã Tẩu, and prevent Normal users from recovering locked values through browser tools or bulk API downloads.

## Products and entitlement

- `market` is Normal; `full` is Plus.
- Normal products: 3 days/3,000 VND, 7 days/7,000 VND, 15 days/15,000 VND, 30 days/30,000 VND.
- Plus has one product: 30 days/40,000 VND.
- Existing active `full` subscriptions migrate once to `market`.
- Payment orders persist their target plan. Completion extends the current expiry and sets the purchased plan.

## Option classification

Normal-visible labels include basic attributes, Dã Tẩu status-duration requirements, single-element resistance, defense, and recovery. Plus-locked labels include attack/movement speed, physical and elemental damage, drain, accuracy, luck, all resistance, reflection, damage-to-mana conversion, inherent skills, and unknown labels by default. Classification uses a server-side exact allowlist so new unreviewed options cannot leak.

## Market API

- The API accepts validated server-side filters and a cursor, with at most 100 items per response.
- The server reads the latest snapshot, applies every filter, flattens matching shop items, slices one page, then rebuilds shop groups.
- Normal responses retain only allowlisted option objects and expose only `locked_option_count` for removed options.
- Plus responses include all option objects.
- Filter metadata for Normal includes only visible labels.
- Responses use `Cache-Control: private, no-store`.

## Client experience

- Market filters request pages from the server with a short debounce.
- Results retain grouping by shop and offer `Xem thêm` when a cursor exists.
- A Normal item with locked options displays one blurred synthetic block: `Mở khóa N dòng Plus`.
- Clicking opens a compact Plus modal with 30-day/40,000 VND checkout.
- No real locked label/value is present in Normal HTML, React state, or network responses.

## Abuse protection

- A Supabase RPC atomically limits market reads by user in fixed one-minute windows.
- Normal and Plus share a conservative request ceiling sufficient for normal filtering and pagination.
- Requests over the limit return HTTP 429 with `Retry-After`.
- Threshold violations create an audit record containing user id, an HMAC IP hash, user agent, timestamp, and reason; raw IP addresses are never stored.
- Production browser source maps remain disabled and security headers are configured.
- Authorized Plus users can still copy pages they are allowed to view; the design increases cost and visibility of bulk collection rather than claiming impossible absolute prevention.

## Admin and desktop

- Admin labels expose Normal and Plus choices while keeping stored enums unchanged.
- Desktop entitlement reports the same plan features. Desktop market data is redacted for Normal and full for Plus; it does not retain the old assumption that only `full` can read the market.

## Verification

- Unit-test product prices, option classification, redaction, filtering, pagination, and entitlement features.
- Route source/integration tests cover rate limiting, headers, plan persistence, Plus checkout, and desktop parity.
- Apply migration, run full tests/typecheck/build, deploy, and verify production.
