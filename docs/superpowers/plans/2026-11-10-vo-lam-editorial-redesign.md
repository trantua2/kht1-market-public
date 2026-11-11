# Võ Lâm Editorial Public Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign every public commercial page with the approved light nostalgic Võ Lâm editorial system while preserving all behavior.

**Architecture:** Shared header and footer components provide one public shell. Existing page and client components retain data/auth/payment logic while receiving semantic editorial markup; `globals.css` becomes the single organized visual system for all routes and breakpoints.

**Tech Stack:** Next.js App Router, React 19, TypeScript, CSS, Supabase Auth, SePay.

---

### Task 1: Shared editorial shell

**Files:**
- Create: `components/site-header.tsx`
- Create: `components/site-footer.tsx`
- Modify: `app/layout.tsx`

- [ ] Create `SiteHeader` with the KHT1 Market wordmark, Products, Pricing, and Account links, plus an optional client-side sign-out button.
- [ ] Create `SiteFooter` with concise product identity and one-time-payment wording.
- [ ] Keep the root layout focused on metadata and global CSS; pages opt into the shared shell so the centered login screen remains intentional.
- [ ] Run `npm run typecheck`; expect no TypeScript errors.
- [ ] Commit with `feat: add editorial public site shell`.

### Task 2: Market catalogue and entitlement gate

**Files:**
- Modify: `components/market-client.tsx`
- Modify: `app/market/page.tsx`

- [ ] Replace the market hero navigation with `SiteHeader`, catalogue title, update status, and catalogue statistics.
- [ ] Preserve every filter, filtering function, shop grouping, render limit, table field, loading state, and error state.
- [ ] Add semantic classes for catalogue masthead, filter toolbar, shop ledger, and compact mobile rows.
- [ ] Wrap the no-subscription package view in the same shared header/footer while reusing `PricingCards` and `BILLING_PRODUCTS`.
- [ ] Run `npm run typecheck`; expect no TypeScript errors.
- [ ] Commit with `feat: redesign public market catalogue`.

### Task 3: Pricing, account, payment, and desktop connection

**Files:**
- Modify: `app/pricing/page.tsx`
- Modify: `components/pricing-cards.tsx`
- Modify: `app/account/page.tsx`
- Modify: `app/payment/result/page.tsx`
- Modify: `app/desktop/connect/page.tsx`
- Modify: `components/desktop-connect.tsx`

- [ ] Apply the shared header/footer to pricing, account, payment result, and desktop connection pages.
- [ ] Present pricing cards as service certificates without changing checkout creation or form submission.
- [ ] Present account details as a membership record with email, package, status, and expiry.
- [ ] Present payment callbacks as a compact status document supporting `PAID`, `success`, cancel, and error cases.
- [ ] Present desktop authorization as a clear trust confirmation while keeping its API payload unchanged.
- [ ] Run `npm run typecheck`; expect no TypeScript errors.
- [ ] Commit with `feat: redesign commercial account and payment pages`.

### Task 4: Login and registration

**Files:**
- Modify: `app/login/page.tsx`
- Modify: `components/password-auth-form.tsx`

- [ ] Replace the current K1 tile presentation with an editorial brand header, decorative rule, and concise login copy.
- [ ] Preserve login/register switching, credential validation, Supabase calls, redirect behavior, messages, and autocomplete attributes.
- [ ] Add semantic classes for the editorial auth panel and form actions.
- [ ] Run `npm run typecheck`; expect no TypeScript errors.
- [ ] Commit with `feat: redesign public authentication`.

### Task 5: Complete visual system

**Files:**
- Modify: `app/globals.css`

- [ ] Replace dark tokens with parchment, ink, cinnabar, antique-gold, muted-ink, rule, success, and error tokens.
- [ ] Define global typography, paper texture, focus states, buttons, inputs, shared header/footer, editorial panels, and ornaments.
- [ ] Define catalogue filters, grouped shop ledger, dense item table, element colors, pricing certificates, auth, account, payment, and desktop connection styles.
- [ ] Add tablet and mobile rules that avoid horizontal page overflow, stack market rows, preserve 40-pixel controls, and wrap navigation.
- [ ] Run `npm run build`; expect a successful production build.
- [ ] Commit with `feat: apply vo lam editorial design system`.

### Task 6: Visual verification and production delivery

**Files:**
- No source changes unless visual inspection reveals a defect.

- [ ] Start the production build locally and inspect login, no-subscription market, active market, pricing, account, payment result, and desktop connection.
- [ ] Inspect at desktop width and mobile width; verify no page overflow and that navigation remains usable.
- [ ] Verify market filters, reset, sign-out, pricing checkout request, and payment-result navigation.
- [ ] Run `npm run test`, `npm run typecheck`, and `npm run build`; expect all commands to succeed.
- [ ] Run `git diff --check`, commit any verified visual corrections, and push the current commit to `origin/main`.
- [ ] Confirm the Vercel production deployment is Ready and serves the new design at `https://kht1-market.vercel.app`.
