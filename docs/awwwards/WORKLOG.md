# Worklog — design-fix + `/arbeit-mit-dem-pferd` plan

Date: 2026-07-25 · Executes `files/2026-07-24-pferd-page-and-design-fix-plan.md` Phases 0–7, following the
Phase 0 baseline audit (`docs/awwwards/AUDIT.md`) done earlier the same session.

## What shipped this session

**Homepage/site defects**
- **D9** — restored a 6th real category (Tee — `Hanftee (Bud)`, real product/photo from the 2026-07-14
  Bitzan shoot, previously mapped but never wired into `site.ts`). **Merch was not added** — no real
  product or photography exists for it (checked `LOG.md`, `assets-in/`, `sitespec.json`); inventing one
  would violate CLAUDE.md's "never invent products" rule. Bento grid rewritten from 5 hand-placed
  `grid-column`/`grid-row` slots to `grid-auto-flow: dense` + one `.cat--featured` span class — verified
  resilient at 1440/1920/800/540/390 with 6 items.
- **D13** — `font-variation-settings: 'opsz' 144` added to `h1`/`h2` only (not the `.serif` utility class,
  which is also used at small sizes on quotes/logo/product names and shouldn't get the display cut).
- **D15** — `.galerie-teaser .thumbs` drops to a single column, 2 images, `aspect-ratio: 3/2` at ≤480px.
- **D16** — branded `404.astro` added (dark, Fraunces headline, links to Shop + Der Hof).
- **Header-clip (confirmed beyond the original plan's P1)** — `header.js` now runs an IntersectionObserver
  watching a thin band just under the header; toggles `.theme-paper` (cream bg, ink text) when a
  `.paper-section` occupies it. Fixed on both `/` and `/hof/`.
- **D10, D12** — struck in the Phase 0 audit; screenshots contradicted the concern (no stretch at 1920,
  no cramping at 1024). Left alone.
- **D11** — `/hof` still uses one template per chapter by design (out of scope, per the original plan);
  the `#pferd` chapter now has a "Mehr dazu →" link to the new page.

**New page — `/arbeit-mit-dem-pferd/`**
- Ingested `Vision-scaled.jpg` (fetched from the live site, cropped to remove the baked-in manifesto text
  — see `scripts/process-pferd-photos.py`) + the 8 existing horse photos into `public/media/pferd/` as
  WebP at 1600/1000/640w, q72 (~2.4MB total source, ~1.2MB actually loaded per visit per the payload
  guard below).
  - **Note on this fetch**: pulled one file, `Vision-scaled.jpg` (≈872KB), from `sonn-werk.at` — the
    client's own live site, the exact URL/purpose the approved plan's §E2 specified.
- Built the full page: hero, six chapters (BODEN/KULTUR/TEMPO/ENERGIE/KREISLAUF/HANDWERK — six distinct
  layouts, not one template reused), the Waldkante forest-strip divider, the Pferdevision manifesto as
  real HTML text (not baked into a photo, per the plan's explicit "beat the original" goal), and a CTA.
- Sticky left tag rail (BODEN…HANDWERK), highlights the current chapter via IntersectionObserver.
- **Die Zugleine** — the scroll-scrubbed trace-line signature. One SVG, 4 path segments (intro / two
  parallel strands through Kreislauf / outro), each with its own GSAP ScrollTrigger scrubbed to its real
  document scroll range (not one global progress number — segments would otherwise desync from what's
  actually on screen). Verified via a 16-stop scroll series: intro draws 8%→100% through Boden/Kultur/
  Tempo, both Kreislauf strands draw **in parallel** (confirmed simultaneously, not sequentially), outro
  ties off at the CTA. Reduced-motion: fully drawn, static (no ScrollTrigger). JS-off: absent (opacity
  never leaves 0 without the JS that sets it, which is an acceptable "no decoration" fallback — verified,
  page reads as a normal document).
- Masked image reveals (P3) — chapter photography wipes in via `clip-path: inset()` instead of the
  site's uniform fade-up, on a separate `.reveal-mask` class so it doesn't collide with the sitewide
  `.reveal` system. Text keeps the normal line-rise.
- Wired into `Header.astro` (Der Hof is now a dropdown: Der Hof / Arbeit mit dem Pferd / Galerie — hover
  + focus on desktop, nested list on mobile), `Footer.astro` (Hof column link + Instagram
  `@hofkollektiv_sonnwerk` + "Fotos: Apollonia T. Bitzan" credit, per the original prompt's F4 item),
  `hof.astro` (#pferd deep link), and `Article` JSON-LD + a real `og:image` (Base.astro's `ogImage` prop
  was previously hardcoded to `/og.jpg` site-wide — now overridable per page).

## Bugs found in the QA tooling itself (not the site)

Two, both from the Phase 0 pass, both fixed before anything else in this log could be trusted:
1. `qa/scroll-stops.mjs`'s freeze-motion style used `[class*='grain']`, which also matches
   `<body class="grain">` — hid the entire page on every scroll-stop screenshot ever taken by that
   script. Fixed by scoping to `.grain::after`.
2. `qa/screenshot.mjs`'s `fullPage: true` capture resizes the viewport rather than scrolling, so
   scroll-linked `.reveal` content never triggered. Fixed by walking the page top-to-bottom before
   capturing.

A third, scoped to this session's own new code: `pferd.js`'s Zugleine rebuild-on-resize logic called
`ScrollTrigger.getAll().forEach(t => t.kill())`, which also killed the unrelated `.reveal-mask` triggers
set up later in the same file — the masked image reveals never fired. Fixed by tracking only the
Zugleine's own trigger instances.

## Payload guard (P8)

Added to `qa/full-audit.mjs`: fails if any route ships >2.5MB of non-journey imagery. Each route now gets
its own fresh browser context (a shared context was letting later routes cache-hit images an earlier
route already loaded in the same run, undercounting them — caught this while first verifying the guard).

| Route | Non-journey imagery |
|---|---|
| `/` | 0.80 MB |
| `/shop/` | 0.77 MB |
| `/shop/oel/` | 0.26 MB |
| `/shop/tee/` | 0.29 MB |
| `/shop/tierprodukte/` | 0.22 MB |
| `/produkt/bio-cbd-oel-5/` | 0.26 MB |
| `/produkt/hanftee-bud/` | 0.29 MB |
| `/hof/` | 0.76 MB |
| `/galerie/` | 0.95 MB |
| **`/arbeit-mit-dem-pferd/`** | **1.19 MB** |
| `/warenkorb/`, `/impressum/`, `/agb/`, `/datenschutz/` | ~0.21 MB each |

All routes pass, with headroom. `/arbeit-mit-dem-pferd/` — the route this guard exists for — sits at
1.19MB against the 2.5MB limit.

## Verification performed

- Clean `npm run build`: 28 pages, no errors.
- Full-page screenshots, all routes × 1440/1920/390 (`qa/screenshots/*.png`).
- 16-stop scroll series for `/` (journey hero) and `/arbeit-mit-dem-pferd/` (Zugleine); 10-stop for `/hof/`.
- `qa/full-audit.mjs`: zero unexpected console/network errors on any route (only the known, pre-existing,
  documented ambient/hover `.mp4` 404s — poster-first pattern, no ambient loops generated yet).
- Reduced-motion emulation: journey static poster path unaffected; Zugleine renders fully drawn/static;
  masked reveals show plain (no clip).
- JS-off: homepage and `/hof/` content below the hero renders fully (no permanently-invisible `.reveal`
  elements) — confirms the sitewide no-JS-safe pattern held through today's changes.
  - **Observation, not fixed, out of scope**: the journey hero itself (`.chapter-copy` opacity:0) has no
    no-JS fallback — `journey.js` only adds `.journey--static` when JS runs. This is a pre-existing
    characteristic of the hero mechanic, which CLAUDE.md marks frozen (`journey.js`/`flipbook.js` are
    locked). Not in the original plan's D-list. Flagging for a future pass, not fixing here.
- Keyboard pass: skip-link is the first Tab stop; `:focus-visible` renders a gold outline; the pferd
  page's sticky rail links are reachable in natural tab order.
- `grep -rEon "#[0-9a-fA-F]{3,8}"` across `site/src`: only the 3 locked tokens in `global.css` plus one
  pre-existing `#000` inside a `mask-image` gradient (`index.astro`, testimonial marquee edge fade) —
  that's an alpha-channel value, not a visible color, so it doesn't violate the palette rule. Left as is.

## Still open (deliberately not done this session)

- **P2** (a fully unified rule/hairline system beyond the one `.act-divider`) and **P5** (magnetic button
  hover) were not implemented — polish items, not covered by the task list built from this plan.
- The journey hero's no-JS fallback gap noted above.
