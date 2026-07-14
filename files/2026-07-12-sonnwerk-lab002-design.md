# DESIGN SPEC — lab/002-producer: SONNWERK „Vom Feld in die Flasche"

**Date:** 2026-07-12 · **Owner:** Russ / Convenium
**Client:** SONNWERK (sonn-werk.at) — Austrian BIO CBD producer, Hofkollektiv
**Status:** Design approved section-by-section in session; awaiting final spec review

---

## 1. Decisions (locked)

| Decision | Choice |
|---|---|
| Scope | Full site rebuild INCLUDING shop |
| Commerce | Headless WooCommerce — existing Woo install stays as backend (Store API); products, orders, Viva payments, accounts, affiliate system untouched |
| Media | Hybrid: real stills (Apollonia Bitzan product photography + client farm photos) as identity anchors, AI camera motion via Flow/Veo image-to-video |
| Goal | lab/002 catalog showpiece + sellable client delivery. Design ambition leads; conversion stays solid |
| Archetype | NEW — "Producer / craft-commerce" hybrid of pack archetypes 02 (journey) + 04 (e-commerce). Joins the catalog |
| Stack | Astro (per 2026-07-10 stack decision), Cloudflare Pages |

## 2. Concept

The scroll IS the product's provenance. One continuous chained camera journey from sunrise over the hemp field to the finished bottle — the brand's transparency claim („wenn 11% draufsteht, sind 11% drin") made literal. Differentiator: every CBD brand shows the bottle; nobody shows the path.

## 3. Brand tokens (lock BEFORE any media — Gate 1 judges against these)

- Base: deep warm green-black `#0D1408` (living green-black, not lab/001 charcoal)
- Paper: warm cream `#F2EBDC`
- ONE accent: sun-gold `#E8A33D` (golden-hour light, oil, CTAs)
- Grade: golden-hour amber, soft haze, subtle film grain — real-footage feel, never synthetic-clean
- Type: high-contrast editorial serif (display) + grotesque (UI/shop). Reads „Hofkollektiv", not „startup"
- **Rejection criteria:** accent drifts cold/neon · clinical white backgrounds · cannabis-culture clichés (leaf decoration) · anything reading „dispensary" · identity break between still and clip · >1 camera move per clip · readable text/logos/faces in focus

**Fixed HUD:** thin vertical process meter, right edge (ABYSSAL depth-meter mechanic): `FELD → ERNTE → EXTRAKTION → FLASCHE`, fills sun-gold with scroll progress. Doubles as chapter navigation (click = scroll to chapter).

## 4. Scroll & animation system

### 4.1 Journey hero — FLIPBOOK method (per project §4 spec; never video.currentTime)

Four chained 8s clips, final-frame → start-frame:

1. **FELD** — dawn aerial drift over hemp field, sun breaking horizon
2. **ERNTE** — descend into rows; hands cutting a plant, macro (derived from real farm stills)
3. **EXTRAKTION** — interior; golden oil through glass, slow drip macro
4. **FLASCHE** — drop lands; camera pulls back from droplet to finished bottle in golden light (real Bitzan bottle still as anchor)

- Single fixed `<canvas>`, hero 24fps. Four clips ≈ 600–760 frames exceeds the 8–15 MB payload target → **preload clips 1–2; lazy-load clips 3–4 while user scrolls chapter 1**
- Lenis smooth scroll; chapter copy blocks („Feld"/„Ernte"/„Extraktion"/„Flasche") pinned at clip seams, sliding over canvas
- Seam QA frame-by-frame on all 3 joints; trim warped first/last frames before extraction

### 4.2 Below the journey — ambient-loop pattern (lab/001 §4a)

Native looping `<video>` (muted/autoplay/loop/playsinline, poster-first) for section moods: horses/Kutschenfahrten, tea steam, balm texture, dogs. Flipbook ONLY for the journey.

### 4.3 Shop-layer motion (conversion-safe)

Product cards with hover video loops (archetype-04 mechanic); grade-matched still-life on cream; cart drawer; **no scroll-jacking below the hero**.

### 4.4 Fallbacks & degradation

- `prefers-reduced-motion` → poster stills, normal scroll
- Mobile → half-res frame sets; journey shortened to clips 1 + 4 (FELD → FLASCHE) with crossfade — **approved creative decision**
- Frame-sequence load error → canvas swaps to chapter poster still; site fully readable/navigable with JS off

## 5. Site structure (Astro routes)

| Route | Content |
|---|---|
| `/` | Journey hero (4 chapters) → Warum Sonnwerk (3 principle blocks, scroll reveals) → 6 category cards (hover loops) → BIO für Hunde (ambient loop) → kinetic testimonial quotes → Versand/Trust → footer |
| `/shop`, `/shop/[kategorie]` | Filterable grid: Öl, Kosmetik, Gel, Balsam, Tee, Tierprodukte, Merch |
| `/produkt/[slug]` | Gallery, quantity/add-to-cart, reviews, related products (Woo Store API) |
| `/hof` | Hofkollektiv narrative — merges current „Arbeit mit dem Pferd", „Unser Hanf", „Kutschenfahrten" pages into one scroll story with ambient loops |
| `/warenkorb` → checkout | Cart drawer + page; checkout hands off to existing Woo checkout (phase 1) |
| `/mein-konto`, legal | Account links to Woo; Impressum/AGB/Datenschutz/Affiliate ported 1:1 |

## 6. Media brief (two-gate workflow + Gate 0)

**Gate 0 — real anchors (collect):** Bitzan product stills (exist), client farm/field/horse photos, one bottle hero still.

**Gate 1 — identity stills (iterate cheap, owner approval before ANY video):**
- One master grade still: „golden hour hemp field"
- 4 chapter start frames + end frames, derived via same-scene multi-frame trick (end frame = start frame edited for camera position ONLY, never content)
- Reference bleed rule: „use reference ONLY for color grade, lighting character, and grain"

**Gate 2 — clips (every one referencing approved stills):**
- 4 journey clips — Frames-to-Video, chained, camera instruction isolated and first, style-hold clause, no readable text
- ~4 ambient loops — horses, tea steam, balm macro, dogs
- 6 product hover loops — from Bitzan stills, subtle turntable/light drift
- All 1080p · 16:9 · 8s · „no dialogue, no music" + strip AAC (`ffmpeg -an`)
- Budget: ~14 generations; 2–3 takes on journey clip 1 only, first acceptable take elsewhere

**Ingest:** strip audio → webp extraction (hero 24fps, loops stay video) → posters → compression (~90%) → mobile variants → manifest JSON.

## 7. Architecture & data flow

- **Astro static output.** React islands ONLY: cart drawer, add-to-cart/quantity, account entry, checkout handoff
- **Woo Store API:** products/categories fetched at build time → static product pages, rebuilt via webhook on product change. Cart/stock/checkout live client-side against existing Woo
- **Isolation boundaries:** scrubber core ↔ knows nothing of Woo · commerce islands ↔ know nothing of canvas · manifest JSON = only contract between ingest pipeline and templates
- Content config `src/content/site.ts` (lab template convention), German copy
- Hosting: Cloudflare Pages; Woo remains on current host as headless backend
- SEO: build-time JSON-LD (Product, Offer, AggregateRating, LocalBusiness); 1:1 redirect map from current URLs to preserve rankings

## 8. Quality gates (pre-ship)

1. Seam QA frame-by-frame, all 3 chain joints
2. LCP < 2.5s on 4G mobile (poster-first); CLS ≈ 0 (aspect-ratio boxes)
3. Full live purchase test: cart → checkout → order visible in Woo admin
4. `prefers-reduced-motion` pass + JS-off pass
5. Legal: CBD ad-compliance on all copy (no medical claims); Impressum/Datenschutz ported

## 9. Risks

- **Woo Store API cart over CORS** needs session/nonce strategy — known solved problem, budget ~1 day
- Mobile journey cut (2 clips) is an approved creative decision — do not "discover" it late
- Client dependency: Gate 0 farm photos must arrive before Gate 1 starts

## 10. Out of scope (YAGNI)

Native Astro checkout (phase 2 candidate) · multilingual (DE only) · blog/content marketing · Shopify or any replatform · custom cursor gimmicks below the hero.

## 11. Next step

After spec approval → writing-plans: implementation plan (repo scaffold from lab/001 conventions, ingest scripts, scrubber integration, Woo integration, page builds, QA).
