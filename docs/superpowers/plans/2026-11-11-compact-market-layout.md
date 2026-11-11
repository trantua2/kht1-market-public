# Compact Market Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the oversized market masthead and nested filter cards so market information, filters and results appear in the first viewport.

**Architecture:** Keep all existing market filtering state and API behavior. Change only the `MarketClient` presentation and its responsive CSS, with source-level UI contract tests protecting the approved compact hierarchy and independent reset behavior.

**Tech Stack:** React 19, Next.js 16, TypeScript, CSS, Vitest.

---

### Task 1: Lock the compact hierarchy with failing tests

**Files:**
- Create: `tests/compact-market-layout.test.ts`
- Modify: `tests/editorial-ui.test.ts`

- [ ] Assert that the old masthead, `Chợ giang hồ`, `Dữ liệu mới nhất`, filter kicker labels and framed group classes are absent.
- [ ] Assert that one `market-status-strip`, two plain `filter-section` groups and two `Đặt lại` actions are present.
- [ ] Run the focused tests and verify they fail against the current layout.

### Task 2: Implement the approved V2 market layout

**Files:**
- Modify: `components/market-client.tsx`
- Modify: `app/globals.css`

- [ ] Replace the masthead and market heading with the compact server/count/update strip.
- [ ] Replace framed filter cards with plain `Khu vực & giá` and `Thuộc tính` sections separated by one rule.
- [ ] Keep the existing independent reset functions and filtering request behavior.
- [ ] Add tablet and mobile layout rules matching the approved demo.
- [ ] Run focused tests and typecheck until green.

### Task 3: Verify, integrate and deploy

**Files:**
- Modify only files required by verification failures.

- [ ] Run `npm test`, `npm run typecheck`, and `npm run build`.
- [ ] Commit the implementation.
- [ ] Fast-forward `main`, rerun focused tests, and push `origin/main`.
- [ ] Deploy the existing `kht1-market` Vercel project to production.
- [ ] Smoke-check `/`, `/login`, `/pricing`, and `/market` on the production alias.
