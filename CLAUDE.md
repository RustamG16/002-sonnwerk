# SONNWERK — Project rules for Claude Code

## What this is

A production website for SONNWERK (sonn-werk.at) — Austrian BIO-CBD Hofkollektiv. Astro site in `site/`, vanilla JS + GSAP + Lenis. Concept: „Vom Feld in die Flasche" — the scroll is the product's provenance.

## Read before coding

1. `files/2026-07-12-sonnwerk-lab002-design.md` — the approved design spec.
2. `files/2026-07-13-sonnwerk-lab002-handoff.md` — review state + animation mapping.
3. `LOG.md` — build history and known quality levers.
4. `brandspec.json` — voice, tokens, rejection criteria.
5. `assets/design/` (if present) — target design PNGs (Stitch exports). These are specs to build toward, never images to ship.

## Hard rules

- Colors ONLY: green-black `#0D1408`, cream `#F2EBDC`, sun-gold `#E8A33D` (plus the derived dim/line values in `site/src/styles/global.css`). Gold is the single accent. No new hues, no cold/neon drift, no gradients into other colors.
- Fonts: Fraunces (display serif) + Space Grotesk (body/UI) only.
- Logos as-is; long version stays in the footer. Never redraw or recolor.
- Journey hero: scroll-scrubbed flipbook canvas (`site/src/scripts/flipbook.js` + `journey.js`). NEVER `video.currentTime` scrubbing. The mechanic, four-chapter footage, and payload strategy (eager 1–2, lazy 3–4; mobile clips 1+4) are frozen; overlay copy/typography/HUD styling may evolve.
- `/galerie` infinite drag canvas mechanic is frozen; polish only.
- No scroll-jacking below the journey hero.
- Copy: German, Du-Ansprache, warm/handwerklich. NO medical claims („Heilung", healing promises), no high/Rausch language, keep the footer disclaimer. Real products/prices/quotes only — never invent products, reviews, certificates, people.
- No leaf clichés, no dispensary look, no clinical white, no emoji icons.
- Every animation: `prefers-reduced-motion` path (content simply visible) + JS-off fallback. Elements hidden for scroll reveals must be hidden only under `html.js` (inline head script adds the class) — a no-JS visitor sees everything.

## Verification protocol (every phase — non-negotiable)

The in-app/IDE browser preview does NOT reliably paint rAF, canvas, IntersectionObserver, or scroll-linked work (learned the hard way in lab/003 and lab/004). **Never judge visual or motion work from the preview pane or from code reading. Playwright is the only source of truth.**

1. `npm run build` clean (run inside `site/`).
2. Dev server on :4321 → `node qa/screenshot.mjs` (all routes, 1440/1920/390, full-page) and `node qa/scroll-stops.mjs` (journey + any scroll-animated page, ≥16 stops).
3. **Open and LOOK at the PNGs** in `site/qa/screenshots/`. Critique them against `assets/design/` and the brief. List every deviation — never silently accept.
4. `node qa/full-audit.mjs` — zero console errors, zero 404s, after scroll and hover.
5. Responsive: every changed page verified at 1440, 1920, and 390 wide. Overflow-x, clipped headlines, and misaligned edges at 1920 are release blockers.
6. Do not claim a score, a "pass", or "done" for anything you have not seen in a screenshot from this session.

For QA scripts to drive Lenis, expose the instance: `window.__lenis = lenis` in `journey.js` and `motion.js` (QA hook, no visual effect).

## Known traps (from sibling labs)

- `[hidden]` loses to `display:flex` — always pair with explicit `[hidden]{display:none}`.
- Astro scoped styles + global `.reveal` classes: check selector specificity doesn't cancel section padding.
- Playwright: after `scrollTo` wait ≥500ms for the rAF loop to draw before screenshotting.
- Canvas scrubber inits at 0-width in embedded viewports — init is deferred until `innerWidth > 0`; don't "fix" this.
