# Plus Market Access Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship Normal/Plus pricing, server-side option redaction and paginated filtering, a Plus upsell UI, and durable abuse controls.

**Architecture:** Keep the existing `market`/`full` enum as Normal/Plus, persist the product plan on payment orders, and centralize market projection in pure server-tested functions. API routes call the projection after entitlement and rate-limit checks; clients never receive locked Normal data.

**Tech Stack:** Next.js App Router, TypeScript, Supabase/Postgres, SePay, Vitest.

---

### Task 1: Products and entitlements

**Files:** `lib/billing-products.ts`, `lib/entitlements.ts`, `lib/membership-display.ts`, related tests.

- [ ] Write failing tests for four Normal products, one Plus product, labels, and `market.options.full` feature.
- [ ] Implement product plan fields and updated feature mapping.
- [ ] Run focused tests and typecheck.

### Task 2: Secure market projection

**Files:** create `lib/market-access.ts`, create `tests/market-access.test.ts`.

- [ ] Write failing tests for exact allowlist classification, fail-closed unknown labels, Normal redaction, Plus disclosure, filters, grouped pagination, and cursor behavior.
- [ ] Implement pure parsing, filtering, projection, and pagination functions with a 100-item maximum.
- [ ] Run focused tests.

### Task 3: Payment and abuse migration

**Files:** create Supabase migration; modify checkout and payment tests.

- [ ] Add target plan to payment orders, migrate existing Full subscriptions to Normal, and replace payment completion to apply the purchased plan.
- [ ] Add atomic per-user minute buckets and an abuse audit table/RPC.
- [ ] Insert the product plan during checkout and update source tests.

### Task 4: Paginated API and UI

**Files:** modify web/desktop market routes, market client, pricing cards, CSS, tests.

- [ ] Route validates filters, consumes rate limit, projects the correct tier, and returns no-store pages.
- [ ] Client sends debounced filters, resets cursor, appends pages, and renders synthetic locked blocks.
- [ ] Add Plus modal and checkout for `full_30d`.
- [ ] Keep desktop projection consistent.

### Task 5: Admin, hardening, and delivery

**Files:** admin labels, `next.config.ts`, documentation/tests.

- [ ] Rename customer/admin labels to Normal and Plus.
- [ ] Add security headers and explicitly disable production browser source maps.
- [ ] Run all tests, typecheck, build, and diff checks.
- [ ] Apply Supabase migration, commit, push `origin/main`, and verify Vercel production.
