# SONNWERK — lab/002 site (Astro)

First Astro build in the lab; becomes the Astro convention source for the catalog.

- `npm run dev` (or `preview_start "sonnwerk"` from repo root launch.json — port 4322)
- `npm run media:placeholders` — regenerate placeholder journey frames / posters / product images
- `src/content/site.ts` — the ONLY contract: brand tokens, journey frame manifest, catalog (PLACEHOLDER until Woo Store API wiring), copy slots
- `src/scripts/flipbook.js` — ESM port of `engine/flipbook-scrubber.js` + lab/002 eager/lazy split (clips 1–2 eager, 3–4 lazy)
- Real media ingest: see `../generation-sheet.md` (Gate 0/1/2). Drop frames in `public/media/journey/`, update counts in `site.ts`.
- Woo integration pending: replace `src/scripts/cart.js` (localStorage placeholder) with Store API cart; product fetch at build time; checkout handoff URL in `site.ts`.
