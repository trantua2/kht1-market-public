# Telegram Contact Link Design

## Goal

Give visitors a direct, always-visible way to contact KHT1 Market through Telegram.

## Design

- Add a `Liên hệ` link to the shared top navigation so it appears on every public page.
- Place it before the existing product/account actions to keep support easy to find.
- Link to `https://t.me/cyantou`, open a new browser tab, and use `rel="noopener noreferrer"`.
- Reuse the existing navigation styling; do not add another panel, footer block, or page.

## Verification

- A source-level regression test verifies the label, URL, new-tab behavior, and safe `rel` attributes.
- Run the full test suite, typecheck, and production build.
