# Phase 0 baseline audit — lab/002-sonnwerk

Date: 2026-07-25 · Against: `CLAUDE-DESIGN-FIX-PLAN.md` (2026-07-24) §A (D1–D16) and §C (P1–P8)
Method: dev server on `:4323` (Astro `astro dev`, static output), Playwright (Chromium), screenshots in
`site/qa/screenshots/baseline/` — full-page sweep at 1440/1920/390 for all routes, plus 16-stop scroll
series for `/` (the journey hero) and 10-stop for `/hof/`. Every claim below cites a PNG in that folder.

**Head start:** none of Phase 1–7 in the plan has actually been executed — HEAD is still commit `16fc840`
("Polish site motion, header, and hover media", 2026-07-20), four days *before* the plan was written. A few
D-items already read as fixed below only because that earlier, unrelated commit happened to cover them —
not because anyone worked this plan.

## Before the audit could run: two QA-tooling bugs, now fixed

These are not site defects — they're bugs in `site/qa/*.mjs` that were silently making the verification
protocol lie. Worth flagging because CLAUDE.md treats these scripts as "the only source of truth"; if
they're broken, every prior screenshot-based sign-off on this project is suspect.

1. **`scroll-stops.mjs` hid the entire page on every capture.** The "freeze motion" style injection used
   `[class*='grain']` to mute the noise-texture overlay before scrubbing. `<body class="grain">` (see
   `Base.astro:30`) also matches that selector — so the rule set `body { opacity: 0 !important; visibility:
   hidden !important; }` on every single scroll-stop screenshot ever taken by this script. Confirmed via a
   throwaway diagnostic (`getComputedStyle(document.body)` → `opacity: "0"`, `visibility: "hidden"` at the
   exact moment a screenshot was taken) while the underlying `.reveal` element it was covering was correctly
   at `opacity: 1`. Fixed by scoping the rule to `.grain::after` (the actual pseudo-element) instead of the
   body's class. Before/after of the same stop: content was 100% invisible, now renders correctly.
2. **`screenshot.mjs`'s full-page captures never triggered scroll-linked reveals at all.** Playwright's
   `fullPage: true` resizes the viewport to the document height rather than actually scrolling it, so no
   `scroll` event ever fires — every GSAP `ScrollTrigger`-gated `.reveal` element (i.e. almost all body copy
   below the hero) stayed at `opacity: 0` forever. Fixed by walking the page top-to-bottom in 10 steps
   (locking in each `once: true` reveal) before capturing.

Net effect: prior to these two fixes, a full audit of this site would have concluded the entire page below
the hero was blank on every route — false. `baseline/home-desktop.png` (after fix) vs. the discarded
first-pass capture: same URL, same viewport, night-and-day difference.

## D-item status

| # | Plan verdict | Audit verdict | Evidence |
|---|---|---|---|
| D1 | HIGH — dead void between teaser/quote | **Fixed** (was already fixed pre-plan). Teaser + testimonials now one `.paper-act`, single hairline divider, no unexplained gap. | `baseline/section-b-1440.png`, `-1920.png`, `-390.png` |
| D2 | BLOCKER — no `html.js`, reveals invisible w/o JS | **Fixed.** `Base.astro:14` sets the class inline in `<head>`. | code + `baseline/home-desktop.png` (reveals do show once JS runs) |
| D3 | BLOCKER (1920) — three left edges | **Fixed**, differently than proposed. Header `.bar`, journey `.hero-copy`, and `.wrap` all resolve to the same `--edge` token (64px at 1920, confirmed via computed `getBoundingClientRect().left` = 64 on all three). | measured live, see below |
| D4 | HIGH — no `:focus-visible` | **Fixed.** `global.css:58` + skip-link in `Base.astro:31`. | code |
| D5 | HIGH — no `scroll-padding-top` | **Fixed.** `global.css:17`. | code |
| D6 | MED — inline-style button hack | **Fixed.** `.btn--ink` modifier exists, no inline styles found in `index.astro`/`hof.astro`. | code |
| D7 | MED — dead `reveal.js` | **Fixed.** File no longer exists. | code |
| D8 | MED — grain above header/nav | **Fixed.** `z-index: 45` in `global.css:84`, below header (50) and mobile nav (60). | code |
| D9 | HIGH — catalog has 5, shop has 7 (missing Tee, Merch) | **Still open.** `site.ts:43-48` — 5 categories only. Bento (`index.astro:263-267`) still hardcoded per-slug grid slots, not resilient to a 6th/7th item. | `baseline/cats-1920.png`, `site.ts` |
| D10 | MED — `.cat--oel` stretch risk at 1920 | **Struck — not confirmed.** At 1920 the featured Öl tile shows generous negative space around the product, no visible stretch/distortion. | `baseline/cats-1920.png` |
| D11 | HIGH — `/hof` chapters are one identical template | **Still open** (explicitly out of scope except the deep link, which is also open — see P6). | `baseline/hof-desktop.png`, `stops-hof/*.png` |
| D12 | MED — trust-inner cramped ~800–1100px | **Struck — not confirmed.** Shot at exactly 1024px: three columns, rules, and copy all sit comfortably, no cramping. | `baseline/trust-1024.png` |
| D13 | MED — no optical-size type tuning | **Still open.** No `font-variation-settings` anywhere in `global.css`. | code |
| D14 | MED — smooth-scroll vs. Lenis conflict | **Fixed.** `html.js { scroll-behavior: auto }` + anchors routed through `lenis.scrollTo(..., {offset:-96})` in `motion.js:22-31`. | code |
| D15 | MED — 390 teaser thumbs shrink | **Still open.** `section-b-390.png` shows the teaser still rendering 3 thumbs in a 2-col grid at 390 (plan wanted single column, 2 images max). | `baseline/section-b-390.png` |
| D16 | MED — no 404 page | **Still open.** No `404.astro` in `site/src/pages/`. | code |

## New finding not in the original plan

**Header overlaps headline text on every route with a fixed header, whenever a heading scrolls to the top —
not just the one screenshot in the original report.** Confirmed on both `/` (`section-b-1440/1920/390.png` —
the dark header bar cuts through "Der Hof in Bildern" and the gallery thumbnails) and `/hof/`
(`stops-hof/04-y959.png` — "Vom Samen zum Öl." partially clipped). This is exactly what the plan's **P1**
(header theme inversion) was proposed to fix — it's confirmed real and recurring, not a one-off. Framing it
as a P-item (design improvement) undersells it a little; it reads as a legitimate HIGH-severity item since
it recurs on every page, every time a heading crosses the fixed header.

## P-item (§C improvements) status — none implemented

- **P1** header theme inversion — not implemented (see above, now confirmed with more evidence than the original plan had)
- **P2** unified rule/hairline system — not implemented (only the one `.act-divider` hairline exists ad hoc)
- **P3** masked image reveals (`clip-path` sweep) — not implemented; reveals are still plain fade+translateY
- **P5** `.btn--ink` + magnetic hover — `.btn--ink` exists (see D6), magnetic hover does not
- **P6** header dropdown + `/hof` deep link + footer link — none implemented (`Header.astro:2-5` is a flat 2-link array)
- **P7** keyboard-traversal capture — not run this session (focus-visible styling exists per D4, but no Tab-order screenshot exists)
- **P8** payload guard in `full-audit.mjs` — not implemented; script has no size checks at all

## Phase status recap

- **Phase 0 (this pass):** done — baseline shot, D-items reconciled against real screenshots, 2 tooling bugs fixed.
- **Phase 1 (foundation fixes):** already satisfied by pre-plan commit `16fc840`, not by this plan.
- **Phase 2 (§B section):** already satisfied by the same commit. Header-overlap caveat above still applies.
- **Phase 3 (homepage defects):** partially open — D9, D13, D15, D16 remain; D10/D12 struck.
- **Phase 4 (asset ingest for `/arbeit-mit-dem-pferd/`):** not started. `Vision-scaled.jpg` still not
  fetched; no `public/media/pferd/` derivatives exist.
- **Phase 5 (`/arbeit-mit-dem-pferd/` build):** not started — page does not exist.
- **Phase 6 (P1/P2/P6/P7 improvements):** not started.
- **Phase 7 (final verification):** not run (depends on the above).

## Full screenshot inventory

`site/qa/screenshots/baseline/`:
- `{route}-desktop.png` / `{route}-desktop-fhd.png` / `{route}-mobile.png` — full-page, all 11 routes, 1440/1920/390
- `stops-home/00-y0.png` … `15-y9202.png` — 16-stop scroll series, `/` (journey hero + full page)
- `stops-hof/00-y0.png` … `09-y2158.png` — 10-stop scroll series, `/hof/`
- `section-b-1440.png`, `-1920.png`, `-390.png` — close-up of the galerie-teaser + testimonials act
- `cats-1920.png` — close-up of the category bento at 1920
- `trust-1024.png`, `trust-1100.png` — close-up of the trust strip at the disputed breakpoint width
- `edge-check-1920.png` — top-left corner crop used for the D3 edge measurement
