# Claude Code Prompt — SONNWERK → Awwwards-ready (verified-loop edition)

> Run Claude Code from `lab/002-sonnwerk/`. Start in **plan mode**. Paste everything below the line.
>
> This prompt is built on a post-mortem of two earlier runs: lab/005-agency succeeded because the agent had (a) a concrete pixel target (scraped reference PNGs + measured geometry) and (b) a Playwright screenshot loop it was forced to use. lab/003-meridian failed because it had neither — "full creative freedom" with no target and no enforced looking produced a font-size bump and confident self-scores. Every structural choice below exists to prevent that failure mode. Do not soften the verification requirements.

---

You are a senior award-winning front-end designer/engineer (Awwwards Site of the Day standard). This repo is an Astro site (in `site/`) for **SONNWERK** — Austrian BIO-CBD Hofkollektiv (own hemp fields, horse-drawn field work, hand production). Concept: „Vom Feld in die Flasche". Read `CLAUDE.md` first — its hard rules and verification protocol apply to every step and are not restated in full here.

Mission: transform this site to genuinely compete on awwwards.com — better design and UX/UI, real motion and hover craft, a rebuilt farm & production page, upgraded scroll-video quality — with **zero design mistakes surviving to "done" and full responsiveness at 1440 / 1920 / 390**.

---

## 0. Working method — the loop is the method

**You cannot judge design you have not seen.** The IDE preview does not paint rAF/canvas/scroll work. So:

1. **One section (or one page) at a time.** Implement → `node qa/screenshot.mjs` (+ `qa/scroll-stops.mjs` if the change involves scroll) → **open the PNGs and critique them** against the target and this brief → fix → re-shoot → only then move on. Never touch more than one section between screenshot rounds.
2. **Evidence or it didn't happen.** Any claim ("motion added", "responsive fixed", "matches spec") must cite a screenshot file from this session. No rubric self-scores without screenshots behind them.
3. **Critique like a harsh juror**, not like the author. For each round ask: would this exact screen read as art-directed or as template? Is the change actually visible in the PNG? (In the failed meridian run, "kinetic type + cursor + transitions" were claimed but only a font-size increase was visible. Check for exactly this gap.)
4. Keep a running `docs/awwwards/WORKLOG.md`: per section — what changed, screenshot refs, deviations found, deviations fixed.

Setup for this (Phase 0): `npm i -D playwright && npx playwright install chromium` in `site/`; expose `window.__lenis` in `journey.js` and `motion.js` (QA hook); verify the three `qa/*.mjs` scripts run against the dev server.

## 0b. Reference pack — build the target before designing

The agency run worked because the agent built toward pixels, not adjectives. Recreate that:

1. **Baseline:** shoot the entire current site (all routes, 3 viewports, plus 16-stop scroll series of `/` and `/hof`) into `qa/screenshots/baseline/`. This is your "before" and your regression reference.
2. **Target PNGs:** if `assets/design/` contains Stitch exports (Homepage, Shop, Produktdetail, Hof Story), treat them as the layout/mood target to exceed — never ship them, never copy their placeholder imagery. If the folder is missing, say so in the plan and ask for the exports before Phase D; do not proceed on vibes alone.
3. **Principle scrape (recommended):** adapt `../005-agency/scripts/audit-symbolstudio.mjs` (Puppeteer/Playwright page audit: section maps, computed type styles, spacing, scroll-step screenshots, hover diffs) against 2–3 current Awwwards-winning sites in the warm/editorial/craft-commerce space, into `refs/<slug>/`. Extract **principles and measurements only** — type scale ratios, section rhythm, easing/duration feel, hover vocabulary. Never copy layout, copy, or assets. sonn-werk.at itself is a **content/data source only** (products, prices, categories, shipping terms) — never a layout reference.

---

## 1. Hard constraints (see CLAUDE.md for the full list)

Frozen mechanics: journey flipbook scrub + meter HUD (overlay text/typography/HUD styling may evolve; footage, scrub, payload strategy stay) · `/galerie` infinite drag canvas · footer logo · the three brand colors. Brand safety: German Du-Ansprache copy, no medical claims, real products/prices only, no leaf/dispensary/clinical-white drift, no scroll-jacking below the hero, reduced-motion + no-JS fallback on everything new.

---

## 2. The named changes (this is the scope — nothing vaguer than this)

Do not interpret this list as themes. Each item is a deliverable with its own acceptance check. If you want to add or drop items, do it in the plan, explicitly.

### A. Global craft system
- **A1 Type escalation:** oversized Fraunces display moments (hero H1, chapter words, section H2s) with a real fluid scale; wide-tracked grotesque eyebrows kept. *Accept: 1440 + 390 screenshots show display type that reads editorial, nothing clips or overflows.*
- **A2 Custom cursor:** small warm dot; grows with context labels — „Ziehen" on the galerie canvas, „Ansehen" on product/category cards, arrow on links. Fine-pointer only; off for touch and reduced-motion; native cursor never hidden for interactive a11y. *Accept: screenshot of each context state.*
- **A3 Magnetic CTAs + link underline animations** on all `.btn` and nav links; spring easing, never linear. *Accept: hover screenshots via Playwright hover.*
- **A4 Page transitions:** Astro View Transitions with one branded moment (cream/gold sweep, <0.5s) so shop ↔ hof ↔ galerie feel continuous. *Accept: scroll-stop capture mid-transition or recording.*
- **A5 Masked image reveals** (clip-path/scale-from-inside, GSAP, `once`) replacing the uniform fade-up `.reveal` on media; text keeps staggered line rises. *Accept: scroll-stops show the reveal mid-state, not just end-state.*
- **A6 Grain & grade tuning:** existing `.grain` layered below nav/above media correctly; subtle golden vignette moments. *Accept: before/after crop comparison.*

### B. Journey hero (overlay only)
- **B1** Redesign chapter copy typography/choreography (staggered line reveals tied to scrub progress, not time); restyle HUD labels/fill; keep all mechanics. *Accept: 16-stop scroll series shows every chapter legible, fades correct at seams, meter tracking.*

### C. Scroll-video quality (all sequences)
- **C1** Re-ingest via `scripts/assemble-journey.py`: extract at ≥1600px, evaluate **AVIF vs WebP** at equal byte budget (report the comparison), keep the 8-frame seam crossfades, regenerate mobile set. J2/J3 sources are 720p — flag that 1080p re-downloads are the biggest lever; I'll supply them if available.
- **C2** Player: `imageSmoothingQuality='high'`, confirm true devicePixelRatio rendering, two-frame alpha-blend on fast scrub. Frozen mechanics untouched.
- *Accept: same-stop before/after screenshots at 1440 and a payload table (eager/lazy/mobile) vs the current 23MB/6.8MB.*

### D. `/hof` — rebuilt as the second act (currently 3 thin blocks)
- **D1** Chapters: Unser Hanf · Arbeit mit dem Pferd · Handarbeit & Ernte · **Produktion & Extraktion** (the transparency claim „Was draufsteht, ist drin" made visible — batch → lab analysis → certified bottle) · Kutschenfahrten (inquiry CTA). Editorial asymmetric layouts, big serif chapter words, parallax stills/ambient loops, A5 reveals. *Accept: full-page 1440 + 390 screenshots reading as an art-directed story, no two chapters sharing one template.*

### E. Homepage additions
- **E1** Process strip bridging journey → shop (4 chapter stills, links to `/hof` chapters).
- **E2** Labor-Transparenz moment („Was draufsteht, ist drin.") with certificate/batch visual.
- **E3** Versand band (real terms: free AT ab €29 / DE ab €39, same-day dispatch).
- **E4** Kinetic treatment of the customer quote (real quotes only).
- **E5** Category-card hover video loops — generate per `files/media-generation-guide.md` from Bitzan stills (subtle light-drift only); wiring already exists in `motion.js`. If loops can't be generated this session, implement a still-based hover treatment (slow scale + gold label slide) so hovers are never dead.
- *Accept each: before/after screenshot pair.*

### F. Chrome & states
- **F1** Header scroll behavior + mobile menu choreography; **F2** focus-visible styles sitewide; **F3** 404 page; **F4** footer polish (keep long logo; add Instagram @hofkollektiv_sonnwerk + „Fotos: Apollonia T. Bitzan" credit). *Accept: screenshots incl. keyboard-Tab traversal capture.*

---

## 3. Phases

- **Phase 0 — Setup + reference pack** (§0/§0b). Output: baseline screenshots, refs, working QA scripts.
- **Phase A — Audit** → `docs/awwwards/AUDIT.md`: per page, rubric-scored (Design 40 / Usability 30 / Creativity 20 / Content 10) with screenshot citations, defect list with file refs.
- **Phase B — Plan** → `docs/awwwards/PLAN.md`: the §2 items ordered by impact, per-item acceptance checks, any additions/removals argued, dependency list with sizes. **Stop here for my approval.**
- **Phase C — Shop Phase-2 spec, NO CODE** → `docs/awwwards/SHOP-PHASE2.md`: plain-language explanation for the client that the live shop stays on their existing WooCommerce (WordPress/Divi, Viva payments, accounts, affiliates untouched); our Astro site will fetch products/prices via the **Woo Store API at build time** (webhook rebuild on product edits), run the cart client-side against the Store API (CORS/nonce risk ~1 day), and **hand checkout off to their existing Woo checkout**. This session: only keep `content/site.ts` product shapes Store-API-compatible and `cart.js` isolated as a swappable module.
- **Phase D — Implementation** in the §0 loop, one §2 item at a time, WORKLOG updated per item.
- **Phase E — Final verification:** full `qa/screenshot.mjs` + `scroll-stops.mjs` (journey ≥16 stops, `/hof`) + `full-audit.mjs`; clean `npm run build`; reduced-motion pass (emulate in Playwright); JS-off page readable; keyboard focus visible; no overflow-x at 390 or misalignment at 1920; grep for hex colors outside the token set; payload table. Re-grade the rubric **only from Phase E screenshots**.

---

## 4. Definition of done

Every §2 item either meets its acceptance check with cited screenshots, or is listed in WORKLOG as explicitly deferred with a reason. No console errors on any route after load, scroll, and hover. Build clean. Responsive verified at all three widths on every changed page. Docs (`AUDIT.md`, `PLAN.md`, `SHOP-PHASE2.md`, `WORKLOG.md`) current. Nothing claimed that a screenshot doesn't show.
