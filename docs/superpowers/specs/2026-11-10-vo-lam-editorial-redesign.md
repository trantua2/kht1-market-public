# Võ Lâm Editorial Public Redesign

## Goal

Redesign the complete public commercial site with a nostalgic Võ Lâm editorial style while preserving authentication, entitlement, market filtering, subscription, and SePay behavior.

## Scope

The redesign covers:

- Login and registration
- Market viewer and the no-subscription purchase gate
- Pricing
- Account
- Payment result
- Shared navigation and page structure

The local scanner admin and desktop application are outside this scope.

## Visual Direction

- Use warm parchment and ivory surfaces instead of the current dark dashboard.
- Use dark brown text, muted ink, cinnabar red, antique gold, and restrained five-element colors.
- Use an editorial serif for display headings and a readable system sans-serif for controls and dense market data.
- Build nostalgia with typography, thin rules, corner ornaments, subtle paper texture made in CSS, and generous page framing. Do not add heavy image backgrounds.
- Keep corners mostly square and avoid modern glass, neon, gradients, and oversized dashboard cards.

## Shared Structure

- Add a shared public header with the KHT1 Market wordmark and links for Products, Pricing, and Account.
- Support signed-in actions, including sign-out, without duplicating navigation markup across pages.
- On narrow screens, wrap the navigation into a compact two-row header without hiding primary destinations.
- Add a restrained footer with product identity and payment terms.

## Market

- Preserve the current shop-grouped data model and filtering behavior.
- Present the page as a market catalogue with a clear title, update state, total shops, and total items.
- Place the filters in a bordered parchment toolbar. Keep every current filter and reset action.
- Render each shop as a section separated by a strong top rule. Emphasize shop name, owner, city, coordinates, and item count.
- Keep the dense desktop item table for efficient scanning. On mobile, retain the existing stacked-item behavior.
- Keep element colors readable against the light background and make prices visually distinct without dominating item names.
- Keep the 500-item render cap and all empty, loading, and error states.

## Subscription Gate and Pricing

- A signed-in user without `market.read` sees the four existing packages directly on `/market`.
- Reuse the same pricing cards on `/pricing` for renewals and extensions.
- Style packages as service certificates with duration, total price, daily price, badge, and purchase action.
- Highlight the 30-day package as best value using border and seal treatment, not scale or bright effects.
- Preserve checkout submission and error handling in `PricingCards`.

## Login and Account

- Present login and registration inside a centered editorial panel with the shared brand treatment.
- Keep email/password behavior, validation, mode switching, and redirect behavior unchanged.
- Present account identity, plan, status, and expiry as a compact membership record.
- Keep direct links to market and pricing.

## Payment Result

- Use a clear success/pending/cancelled hierarchy with concise text.
- Keep links back to market, account, and pricing.
- Preserve support for both `PAID` and `success` callback values.

## Components

- Create a shared site-header component responsible only for brand navigation and optional sign-out.
- Create a shared site-footer component.
- Keep business logic inside existing components and route pages.
- Refactor page markup only where needed to use the shared shell and semantic class names.
- Replace the compressed current stylesheet with organized sections for tokens, layout, forms, market, pricing, auth, account, payment, and responsive rules.

## Accessibility and Responsiveness

- Maintain visible keyboard focus states and usable contrast.
- Preserve semantic headings, labels, tables, buttons, and links.
- Keep controls at least 40 pixels high on touch layouts.
- Support wide desktop market tables, tablets, and narrow mobile screens without horizontal page overflow.

## Data and Error Handling

- Do not change API contracts, Supabase policies, package prices, entitlement evaluation, or SePay configuration.
- Continue showing short inline checkout errors.
- Continue redirecting unauthenticated market and account visitors to login with a safe return path.

## Verification

- Run a production build and the existing focused component/page checks.
- Inspect login, no-subscription market, active market, pricing, account, and payment result at desktop and mobile widths.
- Verify filter interactions, sign-out, package checkout creation, and all navigation targets.
- Deploy to Vercel production only after local visual and functional verification.
