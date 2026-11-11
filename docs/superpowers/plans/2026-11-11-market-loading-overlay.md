# Market Loading Overlay Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Show an accessible loading overlay above the result list during market filtering.

**Architecture:** Wrap only the result heading, empty state, shop ledger and pagination in a positioned region. Render a conditional overlay from the existing request-level `loading` state, leaving filter controls interactive.

**Tech Stack:** React 19, CSS, Vitest.

---

### Task 1: Add failing loading-state contracts

- [ ] Assert results are wrapped by `market-results` after the filter sections.
- [ ] Assert `loading` conditionally renders an accessible overlay and message.
- [ ] Assert CSS supplies veil, spinner and animation.

### Task 2: Implement and verify

- [ ] Add the results wrapper and conditional overlay.
- [ ] Add responsive overlay styling without changing filter behavior.
- [ ] Run focused tests, full tests, typecheck and build.
- [ ] Commit, merge, push and deploy production.
