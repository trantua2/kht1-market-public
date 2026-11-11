# Market Loading Overlay Design

## Goal

Make filter requests visibly responsive without blocking filter inputs or causing the results layout to jump.

## Approved Behavior

- Show loading only after the debounced request actually starts.
- Cover only the results region, never the complete page or filter controls.
- Preserve existing results beneath a light veil while loading.
- Center a spinner and `Đang lọc dữ liệu…` above the previous results.
- Keep AbortController cancellation so rapid typing cannot display stale results.
- Hide the overlay on success, error or request cancellation.
- Initial loading uses the same overlay and an empty minimum-height result region.

## Verification

- UI contract tests assert the overlay is conditional on `loading`, uses an accessible live status and leaves filters outside the covered region.
- CSS tests assert the results wrapper, veil and spinner animation exist.
- Full tests, typecheck and production build must pass before deployment.
