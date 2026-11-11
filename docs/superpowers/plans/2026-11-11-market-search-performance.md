# Market Search Performance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make repeated paid-market searches fast by eliminating redundant Supabase catalogue and snapshot reads.

**Architecture:** A focused server-only TTL cache owns catalogue and per-server snapshot loading with promise coalescing and explicit ingest invalidation. The market route overlaps rate-limit and data loading while preserving authorization and rate-limit enforcement; the client uses a shorter debounce.

**Tech Stack:** Next.js 16, TypeScript, Supabase, Vitest.

---

### Task 1: Implement tested cache primitives

- [ ] Add failing tests for hit, expiry, coalescing, invalidation and bounded size.
- [ ] Implement `lib/market-data-cache.ts` with injectable loaders and clock.
- [ ] Run focused tests until green.

### Task 2: Integrate cache and parallel route work

- [ ] Add failing route contract tests for cached loaders, ingest invalidation and `Promise.all`.
- [ ] Replace direct server/snapshot reads in web and desktop market routes.
- [ ] Invalidate the snapshot cache after ingest succeeds.
- [ ] Run route and security regression tests.

### Task 3: Reduce perceived search delay

- [ ] Add a failing UI contract test for the 180ms debounce and AbortController behavior.
- [ ] Change the debounce without changing filter semantics.
- [ ] Run UI regression tests.

### Task 4: Verify and deploy

- [ ] Run full tests, typecheck and production build.
- [ ] Commit, merge to `main`, push and deploy Vercel production.
- [ ] Smoke-check production routes and report measured cache behavior.
