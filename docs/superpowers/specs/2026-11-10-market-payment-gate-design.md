# Market Payment Gate Design

## Goal

Let a signed-in user without an active subscription choose and pay for a package directly on `/market` instead of seeing a dead-end message.

## Flow

1. An unauthenticated visitor to `/market` is redirected to `/login?next=/market`.
2. A signed-in user with `market.read` sees the existing market viewer.
3. A signed-in user without `market.read` sees the four existing packages: 3, 7, 15, and 30 days.
4. `Mua gói` calls the existing `/api/billing/checkout` endpoint and submits the returned SePay payment form.
5. SePay returns the user to the payment result page. The IPN remains responsible for activating or extending the subscription.
6. The result page links back to `/market`, where access is granted after the IPN has completed.

## Reuse

- Reuse `PricingCards` and `BILLING_PRODUCTS`; do not duplicate package data or checkout logic.
- Keep `/pricing` available for active users buying more days.
- Keep current entitlement checks as the single access-control source.

## Interface

- Replace the `Chưa có subscription` panel with the package grid.
- Show only necessary purchase information and a link to the account page.
- Keep the existing market visual system and responsive pricing layout.

## Verification

Per the user's instruction, skip unit tests for this change. Verify the production build, signed-in no-subscription rendering, checkout creation, and production deployment manually.
