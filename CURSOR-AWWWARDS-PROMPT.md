# Cursor Plan-Mode Prompt — SONNWERK → Awwwards-ready

> Paste everything below the line into Cursor **Plan mode**. It is written as a direct instruction to the agent. Do not skip the "Do not touch" section.

---

You are a senior award-winning front-end designer/engineer (think Awwwards Site of the Day level). You are working inside this repository — an Astro site (in `site/`) for **SONNWERK**, an Austrian BIO-CBD Hofkollektiv (hemp farm collective: own fields, horse-drawn field work, hand production, Kutschenfahrten). Concept: „Vom Feld in die Flasche" — the scroll IS the product's provenance. Your mission this session:

1. **Audit** the current site and find everything holding it back.
2. **Produce a concrete, prioritized improvement plan.**
3. **Upgrade the scroll-video (flipbook) quality** on every frame sequence.
4. **Implement** the improvements — better design, UX/UI, motion, hover craft, new sections, and a full farm & production page — so the site can genuinely compete on awwwards.com.
5. **Prepare (not build) the Phase-2 shop integration** — see §7.

Work in Plan mode first: explore the codebase, then output the full plan and wait for my approval **before** editing files. Do not start editing until I approve the plan.

---

## 0. North star

Make this site look and feel **as good as absolutely possible** — the standard is Awwwards **Site of the Day** (8.0+ average across an 18-person jury). Beauty is the priority, but it must not drop frames or break on mobile. Every decision should be defensible to a design jury.

The identity is already strong and locked: **golden-hour Hofdoku** — warm, calm, honest, cinematic-premium. Never "dispensary", never "tech startup", never leaf-cliché. Push the *craft* (type, spacing, motion, interaction detail) far beyond where it is now, while keeping that identity exactly.

You may **add dependencies** (GSAP plugins, a custom-cursor lib, Astro View Transitions helpers, `ffmpeg`/`avifenc` in the ingest scripts, etc.) **if** you justify the performance/craft tradeoff in the plan. Anything shipping to the browser must hold ~60fps on a mid-range phone.

---

## 1. Hard constraints — DO NOT TOUCH

**These stay exactly as they are (mechanics, not pixels):**

- **Journey hero mechanic** — the scroll-scrubbed flipbook canvas (`site/src/scripts/flipbook.js` + `journey.js`): single fixed `<canvas>`, frame-sequence scrubbing (**never `video.currentTime`**), Lenis, right-edge process-meter HUD (FELD → ERNTE → EXTRAKTION → FLASCHE, gold fill, chapter nav), reduced-motion/JS-off poster fallback. You **may redesign the overlay layer** — chapter copy, typography, hero text choreography, HUD styling, scroll hint — but the scrub mechanic, the four-chapter footage, and the payload strategy (eager clips 1–2, lazy 3–4; mobile = clips 1+4) remain.
- **Endless photo canvas** — `/galerie` infinite drag canvas (pointer drag + wheel, lerp inertia, modulo wrap). You may polish (cursor, hint, hover states, image treatment) but the mechanic stays.
- **Logo** — the SONNWERK logos as-is; long version stays in the footer. Do not redraw, recolor, or replace them.
- **Colors** — the locked tokens: green-black `#0D1408`, cream `#F2EBDC`, sun-gold `#E8A33D`. Gold is the ONLY accent (CTAs, prices, active states, meter fill). You may add derived neutrals (dim/line values already exist in `global.css`) but no new hues, no cold/neon drift.

**Brand safety (always enforced):**

- No medical claims, no „Heilung", no high/Rausch language — CBD ad-compliance on every line of copy. Keep the footer disclaimer.
- Rejection criteria from `brandspec.json`: clinical white, leaf clichés, dispensary look, cold/neon drift, identity break between still and clip.
- All copy German, Du-Ansprache, warm/direct/handwerklich-stolz. Real product names and prices only — never invent products, reviews, certificates, or people.
- No scroll-jacking below the journey hero (spec rule). Motion below the hero is reveal/parallax/hover — normal scroll always wins.

---

## 2. Reference material to read first

- `files/2026-07-12-sonnwerk-lab002-design.md` — the approved design spec (concept, tokens, scroll system, routes, quality gates).
- `files/2026-07-13-sonnwerk-lab002-handoff.md` — design review state + animation mapping.
- `LOG.md` — build history; contains known quality levers (read the 07-14 entries carefully).
- `brandspec.json`, `files/media-generation-guide.md`, `generation-sheet.md`.
- `site/src/` — all pages, components, scripts, `styles/global.css` (design tokens), `content/site.ts` (all copy/catalog).
- Source video: `assets-in/NANO/J1–J4_*_APPROVED.mp4` (J1/J4 are 1080p; **J2/J3 are only 720p** — see §4). Ingest scripts in `scripts/`.

Editable surfaces: everything in `site/src/**` plus the ingest scripts, within the §1 constraints.

---

## 3. What "Awwwards-ready" means (your grading rubric)

Awwwards juries score four weighted axes. Grade the **current** site on each (0–10), then target 8.0+:

- **Design — 40%.** Typography, color, imagery, layout, spacing, hierarchy, consistency. Most points live here — spend accordingly.
- **Usability — 30%.** Speed, responsiveness, mobile, intuitive nav, no broken states.
- **Creativity — 20%.** A specific point of view, inventive interaction, something the jury hasn't seen done this well. The provenance journey + horse-powered farm story IS the creative angle — make the whole site feel like one continuous piece of it.
- **Content — 10%.** Copy quality and how well it fuses with the design.

Technical bar: LCP < 2.5s, CLS < 0.1, ~60fps on mid-range mobile, WCAG-considered (contrast, keyboard nav, focus states, reduced-motion, screen-reader labels).

### Awwwards-level elements to draw from (only where they fit the Hofdoku identity)

- **Expressive typography as the primary design element** — oversized Fraunces display moments, kinetic/split-line text reveals (chapter words, the customer quote, section headlines), tight display tracking vs. wide grotesque eyebrows.
- **Directed, meaningful motion** — Lenis everywhere, scroll-triggered masked image reveals (clip-path/scale-from-inside), staggered entrances, parallax depth on editorial sections, **seamless page transitions** (Astro View Transitions) so shop ↔ hof ↔ galerie feel like one surface.
- **Custom cursor & micro-interactions** — a small warm cursor dot that grows into context labels („Ziehen" on the galerie canvas, „Ansehen" on cards, „→" on links); magnetic CTAs; animated link underlines; button hover states with intent. Functional feedback, not gimmicks.
- **Tactile texture** — the film-grain overlay exists (`.grain`); tune it, add subtle golden haze/vignette moments so photography and UI share one grade.
- **Editorial grids** — asymmetry, overlap, generous negative space; break the current "boxes in a wrapper" rhythm on the cream sections.
- Hover **video loops** on category/product cards (the wiring exists in `motion.js`; loops were never generated — produce them per `files/media-generation-guide.md` from the Bitzan stills, subtle light-drift/turntable only).

---

## 4. Scroll-video quality upgrade (explicit deliverable)

The journey frames currently read soft. Fix the pipeline, not just the player:

1. **Source:** J2/J3 are 720p exports — flag in the plan that 1080p re-downloads from Flow are the single biggest lever (I'll supply them if available). Re-extract J1/J4 from their 1080p sources at the highest sensible width.
2. **Re-ingest** (extend `scripts/assemble-journey.py`): extract at ≥1600px (desktop) with higher quality; **evaluate AVIF vs WebP** at equal byte budget — AVIF usually wins visibly at these sizes; keep the 8-frame crossfades at the three seams; regenerate mobile set accordingly. Budget: keep the eager region (clips 1–2) near the current ~11.5MB; report the final payload split in the plan.
3. **Player craft** (within §1 limits): `ctx.imageSmoothingEnabled = true` + `imageSmoothingQuality = 'high'`; verify the DPR-aware canvas actually renders at device resolution; consider two-frame alpha-blend interpolation on fast scrolls so scrubbing reads as motion, not stepping; sharpen the poster.
4. **Seam QA** frame-by-frame on all three joints after re-extraction.
5. Apply the same quality pass to **all** frame/loop media: galerie images, ambient posters, product photos (re-cut from originals where the current crops are soft).

---

## 5. Structure: new sections & the farm/production page

**`/hof` → a real editorial showpiece** (currently three thin alternating blocks). Rebuild as a scroll story worthy of the homepage:

- Cinematic hero, then chapters: **Unser Hanf** (field, seed-to-plant), **Arbeit mit dem Pferd** (the differentiator — horse instead of tractor, soil, silence), **Handarbeit & Ernte**, **Produktion & Extraktion** (own gentle process, own facility — the transparency claim „Was draufsteht, ist drin" made visible: how a batch becomes a certified bottle, lab analysis per Charge), **Kutschenfahrten** (experience the farm; inquiry CTA).
- Use ambient loops/parallax stills per chapter, big serif chapter words, editorial asymmetric layouts. This page carries the "Creativity" score — treat it as the second act of the journey hero.

**Homepage additions** (candidates — argue for/against each in the plan):

- A compact **process strip** bridging journey → shop (the four chapter stills as a horizontal band linking to `/hof` chapters).
- **Labor-Transparenz** moment: „Was draufsteht, ist drin." with certificate/batch visual.
- **Versand/offer band** (free shipping AT ab €29 / DE ab €39, same-day dispatch) — real conversion info from the client.
- Kinetic testimonial treatment for the quote section (real quotes only).
- Footer polish: keep the long logo, add Instagram (@hofkollektiv_sonnwerk) + Bitzan photo credit.

Plus a global pass on Header (scroll behavior, mobile menu choreography), empty/error states, 404, focus states.

---

## 6. Deliverables & phases (Plan mode → then execute)

### Phase A — Audit (write to `docs/awwwards/AUDIT.md`)
Per page (`/`, `/shop`, `/shop/[kategorie]`, `/produkt/[slug]`, `/hof`, `/galerie`, `/warenkorb`, legal) plus global chrome: score on the 40/30/20/10 rubric with one-line reasons; list concrete defects with file references; note anything reading "template" rather than "art-directed"; audit the media pipeline (frame quality, payload, missing loops).

### Phase B — Improvement plan (write to `docs/awwwards/PLAN.md`)
Prioritized, per-page, highest-impact first; the global design-system pass (type scale, spacing rhythm, cursor, transitions, grain); the §4 media pipeline changes with payload math; every new dependency with size + tradeoff.

### Phase C — Shop integration spec, NO CODE (write to `docs/awwwards/SHOP-PHASE2.md`) — see §7.

### Phase D — Implementation (after I approve the plan)
Execute Phase A/B findings. Keep the existing conventions: Astro pages + scoped styles, vanilla JS modules in `src/scripts/`, all copy/catalog in `src/content/site.ts`, poster-first media, reduced-motion and JS-off fallbacks on everything new.

---

## 7. Shop — Phase 2 (explain & prepare, do not build)

Context you must understand and write up for the client in `SHOP-PHASE2.md`: the client's current live shop at **sonn-werk.at** is WordPress (Divi) + **WooCommerce**, with Viva payments, customer accounts, and an affiliate system. We are NOT replatforming. The plan (already locked in the design spec) is **headless WooCommerce**:

- The existing Woo install stays untouched as the backend — products, prices, stock, orders, payments, accounts, affiliates all keep working.
- **Build time:** our Astro site fetches products/categories/prices via the **WooCommerce Store API** and renders static shop/product pages; a webhook triggers a rebuild whenever the client edits a product in the Woo admin they already know.
- **Run time:** cart runs client-side against the Store API (known risk: CORS/session-nonce strategy, ~1 day); **checkout hands off to the existing Woo checkout**, so payments and legal flows stay certified and unchanged.
- Phase 2 scope: Store API wiring, live prices/stock, cart sync, checkout handoff, 1:1 redirect map from old URLs, full live purchase test (order visible in Woo admin).

**This session:** only prepare the seams — keep the product shape in `content/site.ts` Woo-Store-API-compatible (ids/slugs/prices as data, not hardcoded in markup), keep `cart.js` an isolated module so it can be swapped to Store API calls, and make the placeholder prices visibly sourced from one file. Explain in the doc, in plain German-client-friendly terms, that the shop currently on the new site is a visual preview and goes live against their real WooCommerce in Phase 2.

---

## 8. Definition of done (verify before declaring complete)

- `npm run build` passes clean in `site/`.
- Every edited page reviewed at **1440×900** and **390×844**; list any deviations — don't silently accept them.
- Journey scrub verified 0→100%: meter fill, chapter fades, seam quality, no dropped frames; poster→canvas swap invisible.
- Galerie canvas: drag/wheel/inertia intact, reduced-motion static grid intact.
- No console errors on load, after scroll, and after hover, on every page.
- Motion holds ~60fps; `prefers-reduced-motion` path works everywhere; JS-off page still readable; keyboard focus visible; contrast passes.
- No medical claims anywhere; only real products/prices/quotes; tokens unchanged (`grep` for stray hex colors outside the token set).
- `docs/awwwards/AUDIT.md`, `PLAN.md`, `SHOP-PHASE2.md` present and current.
- Report final media payloads (desktop eager/lazy, mobile) against the previous 23MB/6.8MB.

---

## 9. How to work

Start in Plan mode. Explore the repo, read §2, then present **Phase A + B + C** as your plan and **stop for my approval**. Ask blocking questions before, not after. Show rubric scores (before → target) so we can both see the site climbing toward Site of the Day.
