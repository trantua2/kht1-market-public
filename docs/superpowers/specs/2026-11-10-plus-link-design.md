# Plus Link Design

## Goal

Replace the visually heavy blurred placeholder for locked item attributes with one restrained text action.

## Behaviour

- Normal members see their permitted item options followed by `Xem thuộc tính Plus` when one or more attributes are locked.
- The action is muted gray, has no border, background, blur, or locked-option count.
- Hover and keyboard focus increase contrast slightly.
- Clicking the action opens the existing Plus purchase dialog.
- Plus members continue to see every real option and never see this action.
- Locked values remain removed by the server and are not embedded in the page.

## Scope

Only the locked-option presentation changes. Entitlements, pricing, server projection, payment, and modal content are unchanged.

