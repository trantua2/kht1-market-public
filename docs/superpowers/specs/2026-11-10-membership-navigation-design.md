# Membership Navigation and Labels Design

## Goal

Make public navigation feel immediate, replace internal subscription vocabulary with customer-friendly Vietnamese labels, remove the Sabo brand from the public site, and stop offering packages to members whose access is still valid.

## Navigation performance

- Keep Next.js `Link` navigation and explicitly prefetch the three public destinations.
- Replace the slower authenticated user lookup used for ordinary page rendering with verified session claims where supported, while retaining the same authorization boundary and subscription query.
- Add a route-level loading view so navigation acknowledges a click immediately when Supabase or Vercel still needs time to render a protected page.
- Do not weaken server-side entitlement checks or move protected market data into an unauthenticated client cache.

## Customer-facing subscription language

Database values and API contracts remain unchanged. A shared presentation helper maps them for public pages:

- `market` -> `Gói tra cứu`
- `full` -> `Gói hội viên`
- `active` -> `Đang sử dụng`
- `paused` -> `Tạm dừng`
- `expired` -> `Đã hết hạn`
- `revoked` -> `Đã thu hồi`
- no subscription -> `Chưa đăng ký`

Admin and API internals may continue using raw enum values where they are part of an operational contract.

## Active-member pricing behavior

An active member is an entitlement whose feature list includes `market.read`.

- Hide the `Bảng giá` navigation link for active members.
- Redirect an active member who enters `/pricing` directly to `/account`.
- Hide the account-page purchase/extension button while access is active.
- Continue showing pricing to signed-out, unsubscribed, paused, revoked, and expired users.
- The market gate continues to show packages only when the current user lacks access.

## Branding

Remove all visible `Sabo` text from the login brand, shared header, and shared footer. The public identity becomes `KHT1 Market` and `Kiếm Hiệp Tình 1`.

## Verification

- Unit-test label mappings and active/inactive classification.
- UI source tests verify active pricing suppression, redirect behavior, prefetched links, loading UI, and removal of `Sabo`.
- Run the full test suite, TypeScript check, production build, and production deployment verification.
