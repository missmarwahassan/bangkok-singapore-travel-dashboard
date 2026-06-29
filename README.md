# Bangkok + Singapore Travel Dashboard

This folder contains a polished, responsive travel dashboard built from your trip CSV sources.

## Files

- `index.html` — main dashboard
- `styles.css` — visual system and responsive layout
- `app.js` — filters, map, section rendering, editable trip log, CSV export
- `data/trip-data.js` — normalized trip data generated from the attached CSV files
- `exports/trip_updates_template.csv` — blank export/import-style structure for your status notes

## How to use

1. Open `index.html` in a browser.
2. Use the filter bar to narrow by city, neighborhood, category, mood, price, priority, or status.
3. Click `Edit fields` on any card to update:
   - Status
   - Visited
   - My Rating
   - Review
   - Would Return
   - Notes
4. Use `Export Trip Log CSV` to download your current edits from browser storage.

## Notes

- Edits are saved locally in the browser with `localStorage`.
- The map is fully local and self-contained. Pins use source coordinates when they are reliable and fall back to area-level placements when needed.
- Israeli places are excluded from surfaced shortlist entries.
- Tichuca is kept as a planned night.
- Tropic City is marked closed.
- Haawm is marked cut.
- No-pork visibility is built directly into the cards and filters.
