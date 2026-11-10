# Market Payment Gate Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show the existing SePay package checkout directly on `/market` when a signed-in user has no active subscription.

**Architecture:** The server-rendered market page keeps the existing entitlement gate. Its denied branch renders the shared `PricingCards` component with `BILLING_PRODUCTS`, so checkout logic and package definitions remain centralized.

**Tech Stack:** Next.js App Router, React, TypeScript, SePay checkout API, Vercel.

---

### Task 1: Replace the dead-end market gate

**Files:**
- Modify: `app/market/page.tsx`

- [ ] Import `Link`, `PricingCards`, and `BILLING_PRODUCTS`.
- [ ] Keep unauthenticated redirect and active entitlement behavior unchanged.
- [ ] Render the four package cards, account link, and concise purchase heading for a signed-in user without `market.read`.
- [ ] Run `npm run build`; expect a successful production build.
- [ ] Commit with `feat: show checkout options on market gate`.

### Task 2: Return paid users to the market

**Files:**
- Modify: `app/payment/result/page.tsx`

- [ ] Add a direct `/market` link to the payment result actions.
- [ ] Keep `/account` and `/pricing` links available.
- [ ] Run `npm run build`; expect a successful production build.
- [ ] Commit with `feat: return payment results to market`.

### Task 3: Deploy and verify production

**Files:**
- No source changes.

- [ ] Push the completed commit to the production `main` branch.
- [ ] Confirm `https://kht1-market.vercel.app/market` serves the new deployment.
- [ ] Verify a signed-in account without a subscription sees 3/7/15/30-day options and that `Mua gói` reaches the existing SePay checkout endpoint.
