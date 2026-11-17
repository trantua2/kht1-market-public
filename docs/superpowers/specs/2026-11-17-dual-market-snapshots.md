# Dual market snapshots

At ingest, store the complete payload and a Normal projection in the same JSONB snapshot row. Normal retains base item fields and supported Normal options; Plus retains all options. The market API chooses the appropriate payload by entitlement and falls back to the legacy payload for old rows. This needs no schema migration. Search remains server-side and paginated so full data is never exposed to the browser through a static file. Debounce filter requests to avoid one API call per keystroke.
