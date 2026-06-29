# Bangkok + Singapore Travel Dashboard

This folder contains a polished, responsive travel dashboard built from your trip CSV sources.

## Files

- `index.html` — main dashboard
- `styles.css` — visual system and responsive layout
- `app.js` — editable daily schedule, filters, city atlas, section rendering, editable trip log, CSV export
- `data/trip-data.js` — normalized trip data generated from the attached CSV files
- `exports/trip_updates_template.csv` — blank export/import-style structure for your status notes

## How to use

1. Open `index.html` in a browser.
2. Use the editable daily schedule section to move day by day and update the main itinerary directly.
3. Use the filter bar to narrow by city, neighborhood, category, mood, price, priority, or status.
4. Use the city atlas to click neighborhoods and pins, then inspect places in the side panel.
5. Click `Edit fields` on any card to update:
   - Status
   - Visited
   - My Rating
   - Review
   - Would Return
   - Notes
6. Use `Export Trip Log CSV` to download your current trip-log edits from browser storage.

## Notes

- Schedule edits and trip-log edits are saved locally in the browser with `localStorage`.
- The map is fully local and self-contained. It is a neighborhood atlas for planning, not turn-by-turn navigation.
- Israeli places are excluded from surfaced shortlist entries.
- Tichuca is kept as a planned night.
- Tropic City is marked closed.
- Haawm is marked cut.
- No-pork visibility is built directly into the cards and filters.
