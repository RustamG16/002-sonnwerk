# HANDOFF — lab/002-producer SONNWERK (session 2026-07-12/13)

Companion to `2026-07-12-sonnwerk-lab002-design.md` (the full design spec — architecture, media brief, quality gates). This file adds everything decided/produced AFTER the spec: the Stitch design state, review findings, and reusable prompts.

---

## CONTEXT UPDATE (paste as new section into PROJECT-CONTEXT)

### Track C — lab/002-producer: SONNWERK (added 2026-07-12, updated 2026-07-13)

NEW archetype for the catalog: **"Producer / craft-commerce"** (hybrid of 02 journey + 04 e-commerce).
Client: sonn-werk.at — Austrian BIO CBD Hofkollektiv (hemp, horses, Kutschenfahrten, WooCommerce shop). Current site: generic Divi WordPress.

**Decisions (locked):**
- Scope: FULL site rebuild including shop
- Commerce: headless WooCommerce — existing Woo stays as backend (Store API; build-time product fetch + webhook rebuilds; cart/stock live client-side; checkout hands off to Woo in phase 1). Risk: cart CORS/nonce strategy — budget 1 day
- Media: HYBRID — real stills (Apollonia Bitzan product photos + client farm photos) as identity anchors, AI camera motion via Flow/Veo image-to-video. **New Gate 0 = collect real anchors before Gate 1**
- Concept: „Vom Feld in die Flasche" — 4 chained flipbook clips (FELD → ERNTE → EXTRAKTION → FLASCHE), fixed right-edge process-meter HUD (ABYSSAL depth-meter mechanic, doubles as chapter nav); ambient loops + product hover loops below; NO scroll-jacking in shop layer
- Brand tokens: green-black `#0D1408` · cream `#F2EBDC` · sun-gold `#E8A33D` · golden-hour amber grade + soft haze + grain · editorial serif display + grotesque UI. Reject: cold/neon drift, clinical white, leaf clichés, "dispensary" look
- Payload: preload journey clips 1–2, lazy-load 3–4 during chapter-1 scroll
- Mobile journey = clips 1+4 only with crossfade (approved creative decision)
- Goal: lab/002 catalog showpiece + sellable client delivery

**Status 2026-07-13:** Design spec written and approved section-by-section (`2026-07-12-sonnwerk-lab002-design.md`). Visual design generated in Google Stitch and reviewed — 7 fixes pending (below). Next: apply Stitch fixes 1–5 → design pick done → final spec sign-off → implementation plan (writing-plans) → repo scaffold from lab/001 conventions.

**New tool learnings — Google Stitch (for the service/Track B too):**
- No MCP connector exists; web only (stitch.withgoogle.com)
- One prompt CAN produce a full multi-screen design (~5 connected screens max, shared design system), but quality drops beyond 2–3 screens; >5,000-char prompts drop components
- Refinements: ONE change per prompt — bundling changes makes Stitch rebuild/break the layout; screenshot/save every good state (it doesn't reliably remember)
- Hex codes, UI terminology, and mood adjectives ("spacious", "warm") control output strongly
- Stitch does not browse URLs; upload reference images instead. Guard clause needed so it doesn't replicate an existing site's layout (see prompt below)
- Stitch outputs static screens only — write animated elements as their resting frames; ignore Stitch's own "add transition effect" suggestions (motion belongs to the Astro build)
- Sources: stitch.withgoogle.com/docs/learn/prompting/ · discuss.ai.google.dev/t/stitch-prompt-guide/83844

---

## STITCH PROJECT STATE

Project: https://stitch.withgoogle.com/projects/7195323308425446592 („Sonnwerk Editorial E-Commerce", 4 screens: Homepage – Vom Feld in die Flasche · Shop – Premium CBD Produkte · Bio-CBD-Öl 11% – Produktdetail · Unsere Story – Vom Hofkollektiv; + a generated prototype)

**Review verdict:** design system landed (tokens, serif/grotesque, editorial spacing ✓). Keep Stitch's "Apotheke der Natur" shop headline. 7 fixes pending, apply as SEPARATE prompts, in this order:

1. **Hero image wrong (critical):** generic Alpine valley, no hemp.
   → "On the homepage, replace the hero image with an aerial photo of a hemp field at dawn: low sun on the horizon, golden haze, visible rows of hemp plants. Keep the headline and layout unchanged."
2. **Chapters drifted:** Stitch made HANDARBEIT/EXTRAKTION/REINHEIT; spec = ERNTE/EXTRAKTION/FLASCHE (hero = FELD). Chapters must be fullscreen image sections (they become fullscreen canvas clips).
   → "Rename the homepage story chapters to ERNTE, EXTRAKTION, FLASCHE and make each one a fullscreen image section with the chapter word and two lines of text overlaid."
3. **Duplicate heroes:** Unsere Story hero ≈ same mountain valley as homepage. Change to hemp macro or farmstead with horses.
4. **Category grid incomplete:** 5 cards, Tierprodukte missing, several card images empty. Target 6 cards (Öl, Kosmetik, Gel, Balsam, Tee, Tierprodukte), photos on cream.
5. **Shop cards inconsistent:** mixed dark/cream photo backgrounds → all product photos on cream, gold prices.
6. Product-detail gallery thumbnails read monochrome → warm golden-hour product photography.
7. Verify right-edge meter labels = FELD·ERNTE·EXTRAKTION·FLASCHE with gold fill (element exists; labels unconfirmed at canvas zoom).

Fixes 1–5 = minimum before calling the design pick done.

---

## MASTER STITCH PROMPT (regeneration / new variants)

```
A premium editorial e-commerce website for SONNWERK, an Austrian organic BIO CBD
farm collective ("Hofkollektiv"). Vibe: cinematic, warm, crafted, farm-to-bottle
authenticity — spacious and elegant, not a dispensary, not a tech startup.

REFERENCE: sonn-werk.at is the client's CURRENT website. Use it ONLY as a source
of information — product names, prices, categories, German copy, logo, and the
real product/farm photography. DO NOT replicate its layout, typography, spacing,
components, or visual design in any way; the design system below fully replaces
it. From the current site keep only: the SONNWERK logo, the sun-gold tone of the
brand, and the product photos (bottles, balms, tea) shown on cream backgrounds.

DESIGN SYSTEM (apply to all screens):
Background deep green-black #0D1408. Text warm cream #F2EBDC. Single accent
sun-gold #E8A33D for CTAs, prices, active states. Photography: golden-hour amber
tones, soft haze, subtle film grain. Headings in a high-contrast editorial serif;
body and UI in a clean grotesque. Buttons: rectangular, thin gold border, cream
text. Generous whitespace. All copy in German, using real product names and
prices from the reference (e.g. CBD-Gel – Kühlend Stark €24,90, BIO-CBD-Balsam –
Sport Stark €29,90).

Generate 4 connected web screens:

1. HOMEPAGE — Fullscreen hero: dawn aerial photo over a hemp field, headline
"Vom Feld in die Flasche.", sub "Natürlich wirksam. Ehrlich. Für Dich.", gold CTA
"Jetzt bestellen". Thin vertical progress meter fixed at the right edge with
labels FELD, ERNTE, EXTRAKTION, FLASCHE (first glowing gold). Below: three
fullscreen story chapters ERNTE (macro hands harvesting hemp), EXTRAKTION
(golden oil dripping through glass), FLASCHE (finished oil bottle in golden
light), each with a large serif chapter word and 2 lines of text over the image.
Then a cream section "Warum Sonnwerk" with three principle blocks (Bio-
Zertifiziert, Regional, Handgefertigt). Then a dark product category grid of 6
cards: Öl, Kosmetik, Gel, Balsam, Tee, Tierprodukte — product photos on cream,
gold labels. Then a full-width band "Auch für Deine Begleiter." with a calm dog
photo and gold CTA. Then one large serif customer quote. Footer with Austria
Bio-Garantie trust badges and payment icons.

2. SHOP — Header with logo, nav, cart icon. Headline "Apotheke der Natur".
Horizontal category filter pills (gold active state). Product grid, 3 columns:
photo on cream, serif product name, gold price, "In den Warenkorb" button.

3. PRODUCT DETAIL — Two columns: left large product gallery with thumbnails
(warm golden-hour photography); right serif title "Bio-CBD-Öl 11%", star rating,
gold price, quantity stepper, full-width gold CTA "In den Warenkorb", accordion
for Beschreibung / Anwendung / Laboranalyse. Below: customer reviews and a
related products row.

4. HOF STORY PAGE — Editorial scroll page about the farm: hero headline "Vom
Samen zum Öl." over a hemp-macro or farmstead photo (NOT the same image as the
homepage hero), fullscreen image sections alternating with cream text blocks
covering Unser Hanf, Arbeit mit dem Pferd, Kutschenfahrten. Large serif chapter
headings, golden-hour photography.
```

---

## ANIMATION MAPPING (static screen → build motion)

- Hero + chapters = flipbook canvas journey: 4 chained 8s Veo clips FELD→ERNTE→EXTRAKTION→FLASCHE, single fixed `<canvas>`, 24fps, Lenis, chapter copy pinned at clip seams
- Right-edge meter = fixed HUD, fills sun-gold with scroll progress, click = chapter nav
- Category/product cards = hover video loops (subtle turntable/light drift from Bitzan stills)
- Dog band, Hof page sections, tea/balm moods = ambient native `<video>` loops (lab/001 §4a pattern)
- Customer quote = kinetic text reveal; grids = restrained stagger/fade reveals
- Below hero: NO scroll-jacking. `prefers-reduced-motion` → posters. Mobile: clips 1+4 + crossfade, half-res frames
- Frame-sequence load error → chapter poster still; site fully usable JS-off

## WHAT TO BRING TO THE NEW PROJECT

1. PROJECT-CONTEXT (the 2026-07-10 text you have) + the CONTEXT UPDATE section above merged in
2. `2026-07-12-sonnwerk-lab002-design.md` (full spec)
3. This handoff file
4. Gate 0 assets when collecting starts: Bitzan product stills, client farm/field/horse photos, bottle hero still

**Next actions (in order):** apply Stitch fixes 1–5 → design pick approved → final spec sign-off → implementation plan → scaffold Astro repo from lab/001 conventions → Gate 0/1/2 media.
