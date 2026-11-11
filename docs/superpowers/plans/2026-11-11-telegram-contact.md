# Telegram Contact Link Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Telegram contact action to the shared top navigation.

**Architecture:** Extend the existing `SiteHeader` navigation rather than introducing a new component or route. Protect the external new-tab link with the standard relationship attributes.

**Tech Stack:** Next.js, React, Vitest

---

### Task 1: Add the contact link

**Files:**
- Modify: `components/site-header.tsx`
- Create: `tests/telegram-contact.test.ts`

- [ ] **Step 1: Write the failing regression test**

Read `components/site-header.tsx` and assert that it contains `Liên hệ`, `https://t.me/cyantou`, `target="_blank"`, and `rel="noopener noreferrer"`.

- [ ] **Step 2: Verify the test fails**

Run `npm test -- tests/telegram-contact.test.ts`; expect a failure because the contact link is absent.

- [ ] **Step 3: Implement the minimal link**

Add `<a href="https://t.me/cyantou" target="_blank" rel="noopener noreferrer">Liên hệ</a>` as the first action inside `.site-nav`.

- [ ] **Step 4: Verify the change**

Run the focused test, full test suite, `npm run typecheck`, and `npm run build`; expect all commands to exit successfully.

- [ ] **Step 5: Commit**

Commit the test and implementation with `feat: add Telegram contact link`.
