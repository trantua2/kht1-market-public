# Public Trailer and Market Servers Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a persuasive public trailer and partition paid market data by selectable game server, with all existing data assigned to S7 – Cửu Long.

**Architecture:** Supabase owns a small public server catalogue while protected snapshots carry a required server foreign key. Shared server-resolution helpers keep the web and desktop APIs consistent; the admin publisher sends explicit server metadata. The root page renders a synthetic, static product demonstration and never reads paid market data.

**Tech Stack:** Next.js 16, React 19, TypeScript, Supabase/PostgreSQL, Vitest, Python `unittest`.

---

### Task 1: Add the server catalogue and S7 migration

**Files:**
- Create: `supabase/migrations/202611100003_market_servers.sql`
- Create: `tests/market-server-migration.test.ts`

- [ ] **Step 1: Write the failing migration contract test**

Add a test that reads the migration and asserts it creates `market_servers`, seeds `s7-cuu-long`, backfills `market_snapshots.server_slug`, adds the foreign key/non-null constraint and creates the `(server_slug, published_at desc)` index.

- [ ] **Step 2: Run the focused test and verify RED**

Run: `npm test -- tests/market-server-migration.test.ts`

Expected: FAIL because the migration file does not exist.

- [ ] **Step 3: Implement the migration**

Create the catalogue table, public read policy, single-default constraint, S7 seed, safe snapshot backfill and latest-snapshot index. Preserve the existing snapshot RLS behavior.

- [ ] **Step 4: Verify GREEN**

Run: `npm test -- tests/market-server-migration.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/202611100003_market_servers.sql tests/market-server-migration.test.ts
git commit -m "feat: add market server catalogue"
```

### Task 2: Add shared server validation and resolution

**Files:**
- Create: `lib/market-servers.ts`
- Create: `tests/market-servers.test.ts`
- Modify: `lib/market-validation.ts`
- Modify: `tests/market-validation.test.ts`

- [ ] **Step 1: Write failing tests**

Cover canonical server serialization, snapshot validation requiring matching `{slug, code, name}`, active requested-server selection, unknown-server fallback to the default, and failure when no active default exists.

- [ ] **Step 2: Run the focused tests and verify RED**

Run: `npm test -- tests/market-servers.test.ts tests/market-validation.test.ts`

Expected: FAIL because the helper and required server schema are absent.

- [ ] **Step 3: Implement minimal shared helpers**

Define `MarketServer`, `resolveMarketServer(servers, requestedSlug)`, `serverLabel(server)`, and extend `parseMarketSnapshot` to require the server object. Keep database access out of this module.

- [ ] **Step 4: Verify GREEN**

Run the same focused test command; expect all tests to pass.

- [ ] **Step 5: Commit**

```bash
git add lib/market-servers.ts lib/market-validation.ts tests/market-servers.test.ts tests/market-validation.test.ts
git commit -m "feat: validate market server identity"
```

### Task 3: Make ingest and paid APIs server-aware

**Files:**
- Modify: `app/api/admin/market-ingest/route.ts`
- Modify: `app/api/market/route.ts`
- Modify: `app/api/desktop/market/route.ts`
- Create: `tests/market-server-routes.test.ts`

- [ ] **Step 1: Write failing route contract tests**

Assert that ingest looks up an active catalogue row, rejects unknown/mismatched metadata and inserts `server_slug`; web market resolves `?server=`, filters snapshots by the resolved slug and returns `server` plus `servers`; desktop performs the same filtered lookup.

- [ ] **Step 2: Run the focused test and verify RED**

Run: `npm test -- tests/market-server-routes.test.ts`

Expected: FAIL against the current global-latest-snapshot queries.

- [ ] **Step 3: Implement server-aware queries**

Add a small route-local catalogue loader using the admin Supabase client. Ingest verifies slug/code/name and writes `server_slug`. Read routes resolve a default, query `.eq("server_slug", resolved.slug)`, and return an empty projection for active servers without snapshots.

- [ ] **Step 4: Verify GREEN and regression tests**

Run:

```bash
npm test -- tests/market-server-routes.test.ts tests/market-access.test.ts tests/plus-security.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/api/admin/market-ingest/route.ts app/api/market/route.ts app/api/desktop/market/route.ts tests/market-server-routes.test.ts
git commit -m "feat: scope market APIs by server"
```

### Task 4: Add server selection to the paid market

**Files:**
- Modify: `components/market-client.tsx`
- Modify: `app/globals.css`
- Create: `tests/market-server-ui.test.ts`

- [ ] **Step 1: Write the failing UI contract test**

Assert that `MarketClient` renders a server selector before city, sends the selected slug as `server`, resets pagination on selection and displays the active server label in the masthead.

- [ ] **Step 2: Run the focused test and verify RED**

Run: `npm test -- tests/market-server-ui.test.ts`

Expected: FAIL because no server UI exists.

- [ ] **Step 3: Implement the selector**

Extend the page response type with `server` and `servers`, add `server` to filter state and request parameters, reset shops/cursor when it changes, and style the control using the existing editorial toolbar.

- [ ] **Step 4: Verify GREEN**

Run: `npm test -- tests/market-server-ui.test.ts tests/navigation-performance-ui.test.ts tests/editorial-ui.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add components/market-client.tsx app/globals.css tests/market-server-ui.test.ts
git commit -m "feat: add market server selector"
```

### Task 5: Build the pre-login product trailer

**Files:**
- Modify: `app/page.tsx`
- Create: `components/product-trailer.tsx`
- Modify: `components/site-header.tsx`
- Modify: `app/globals.css`
- Create: `tests/product-trailer.test.ts`

- [ ] **Step 1: Write failing landing-page tests**

Assert that `/` no longer redirects, contains the value proposition, pricing/login calls to action, synthetic item demonstration, three-step workflow and `S7 – Cửu Long`; assert the component contains no fetch to `/api/market` and no production shop owner/coordinates.

- [ ] **Step 2: Run the focused test and verify RED**

Run: `npm test -- tests/product-trailer.test.ts`

Expected: FAIL because `/` still redirects.

- [ ] **Step 3: Implement the landing page**

Build a responsive editorial hero, safe synthetic market preview, workflow and supported-server/feature sections. Reuse the existing header/footer, typography, color tokens and button treatment. Provide signed-out links to `/login?next=/market` and `/pricing` without querying Supabase.

- [ ] **Step 4: Verify GREEN and existing navigation**

Run:

```bash
npm test -- tests/product-trailer.test.ts tests/login-ui.test.ts tests/editorial-ui.test.ts tests/membership-navigation-ui.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/page.tsx components/product-trailer.tsx components/site-header.tsx app/globals.css tests/product-trailer.test.ts
git commit -m "feat: add public market trailer"
```

### Task 6: Publish explicit server identity from the admin tool

**Files:**
- Modify: `/Users/tranminhtu/Desktop/KHT1_Sabo/kht_market/publish.py`
- Modify: `/Users/tranminhtu/Desktop/KHT1_Sabo/tests/test_publish.py`
- Modify: `/Users/tranminhtu/Desktop/KHT1_Sabo/README.md`

- [ ] **Step 1: Write failing publisher tests**

Assert the public payload contains `server: {slug: "s7-cuu-long", code: "S7", name: "Cửu Long"}`, accepts explicit constructor/env configuration for future servers, records the server in publish state and rejects incomplete server configuration.

- [ ] **Step 2: Run the focused Python test and verify RED**

Run from `/Users/tranminhtu/Desktop/KHT1_Sabo`:

```bash
python -m unittest tests.test_publish -v
```

Expected: FAIL because server metadata is absent.

- [ ] **Step 3: Implement publisher configuration**

Introduce an immutable server configuration with S7 defaults and environment overrides `KHT_MARKET_SERVER_SLUG`, `KHT_MARKET_SERVER_CODE`, and `KHT_MARKET_SERVER_NAME`. Add the server object to every ingest payload and publish record. Document the variables and warn operators that one scanner instance publishes one configured game server.

- [ ] **Step 4: Verify GREEN**

Run the same Python test command; expect PASS.

- [ ] **Step 5: Commit in the admin repository**

```bash
git add kht_market/publish.py tests/test_publish.py README.md
git commit -m "feat: publish market server identity"
```

### Task 7: Full verification and deployment preparation

**Files:**
- Modify only files required by failures found during verification.

- [ ] **Step 1: Run the public verification suite**

```bash
npm test
npm run typecheck
npm run build
```

Expected: all Vitest tests pass, TypeScript exits successfully, and Next.js production build completes.

- [ ] **Step 2: Run the admin verification suite**

From `/Users/tranminhtu/Desktop/KHT1_Sabo`:

```bash
python -m unittest discover -s tests -v
```

Expected: all tests pass.

- [ ] **Step 3: Apply the migration before deploying code**

Apply `202611100003_market_servers.sql` to the production Supabase project and verify the S7 row and backfilled snapshot count. Do not deploy the server-requiring ingest code before this migration succeeds.

- [ ] **Step 4: Deploy and smoke check**

Deploy the public repository to the existing Vercel production project. Check `/`, `/login`, `/pricing`, and `/market`; confirm an entitled account sees S7 and the current data, while a non-entitled account still sees pricing.

- [ ] **Step 5: Push verified commits**

Push the public branch to the intended production branch and push the admin repository without force-overwriting remote work.
