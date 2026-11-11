# Membership Navigation Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make protected-page navigation respond faster, use customer-friendly Vietnamese membership labels, hide pricing from active members, and remove the Sabo brand.

**Architecture:** Keep database enums and authorization contracts unchanged. Add a pure presentation helper for labels and active-access checks, pass that state into the shared header, and optimize the server entitlement lookup with verified JWT claims before the existing subscription query.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Supabase SSR, Vitest.

---

### Task 1: Membership presentation helper

**Files:**
- Create: `lib/membership-display.ts`
- Create: `tests/membership-display.test.ts`

- [ ] Write failing tests for Vietnamese plan/status labels and `market.read` active access.
- [ ] Run `npm test -- tests/membership-display.test.ts` and confirm failure because the module does not exist.
- [ ] Implement `planLabel`, `statusLabel`, and `hasMarketAccess` as pure functions without changing stored enum values.
- [ ] Re-run the focused test and confirm it passes.

### Task 2: Active-member navigation and pricing suppression

**Files:**
- Modify: `components/site-header.tsx`
- Modify: `app/pricing/page.tsx`
- Modify: `app/account/page.tsx`
- Modify: `components/market-client.tsx`
- Modify: `app/market/page.tsx`
- Test: `tests/membership-navigation-ui.test.ts`

- [ ] Write source-level failing tests that require prefetched links, an `hasAccess` header prop, active pricing redirect, friendly account labels, and no purchase button for active access.
- [ ] Run the focused UI test and confirm the expected assertions fail.
- [ ] Add `hasAccess` to `SiteHeader`, hide `Bảng giá` when true, and set `prefetch` on public links.
- [ ] Redirect active `/pricing` requests to `/account`; otherwise render the current package purchase page.
- [ ] Use friendly labels on pricing/account and hide the extension link when access is active.
- [ ] Pass active access into every authenticated shared header.
- [ ] Re-run the focused test and typecheck.

### Task 3: Faster entitlement lookup and loading response

**Files:**
- Modify: `lib/current-entitlement.ts`
- Create: `app/loading.tsx`
- Modify: `app/globals.css`
- Test: `tests/navigation-performance-ui.test.ts`

- [ ] Write a failing source test requiring `auth.getClaims()`, a route loading component, and its visual marker.
- [ ] Run the focused test and confirm failure.
- [ ] Replace `getUser()` with verified `getClaims()` and construct the minimal user identity required by public pages from `sub` and `email` claims.
- [ ] Add a lightweight editorial loading screen so clicks receive immediate visual feedback.
- [ ] Re-run the focused test and typecheck.

### Task 4: Remove Sabo branding

**Files:**
- Modify: `app/login/page.tsx`
- Modify: `components/site-header.tsx`
- Modify: `components/site-footer.tsx`
- Test: `tests/membership-navigation-ui.test.ts`

- [ ] Add a failing assertion that public application source contains no case-insensitive `Sabo` label.
- [ ] Remove Sabo from login, header, and footer while retaining KHT1 Market identity.
- [ ] Re-run the focused test and confirm it passes.

### Task 5: Verify and deploy

**Files:**
- No source changes unless verification exposes a defect.

- [ ] Run `npm test`, `npm run typecheck`, `npm run build`, and `git diff --check`.
- [ ] Commit the implementation with a focused message.
- [ ] Push the verified commit to `origin/main`.
- [ ] Wait for Vercel production to become Ready and verify `https://kht1-market.vercel.app/login` returns HTTP 200.
