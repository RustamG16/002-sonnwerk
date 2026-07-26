# SONNWERK — /hof/ + /arbeit-mit-dem-pferd/ Fix Plan
*2026-07-26 · scope: content gaps on `/hof/`, layout failure on `/arbeit-mit-dem-pferd/` at ≥1600px, header dropdown, signature replacement*

Evidence for every item below: `site/qa/screenshots/hof-desktop-fhd.png` and `arbeit-mit-dem-pferd-desktop-fhd.png` (1920 full-page, 2026-07-25 run), plus source reading. Nothing here is inferred from the IDE preview.

---

## 0 · Findings (confirmed, not suspected)

### A. `/hof/` — the page is structurally broken, not merely image-less

| # | Finding | Root cause |
|---|---------|-----------|
| A1 | All three story sections render with an **empty image column**. Page is 3177px tall instead of ~6000. | `AmbientMedia.astro`: when `src` is set, `<video>` is `position:absolute` and the `<img>` is `display:none`. Nothing contributes intrinsic height → container collapses to 0. |
| A2 | The ambient videos **do not exist**. `/media/ambient/` contains only the five `.webp` posters; `begleiter/horses/harness/hanf/feld.mp4` were never produced. | Gate 2 video never delivered; `ambientPaths` in `src/content/site.ts` still points at them. Every `<video>` fires a request for a 404. |
| A3 | The `/hof/` hero image is **the same frame as the homepage hero** — `ambient/feld.webp` vs `journey/poster.webp`, mean per-pixel difference 1.1/255 (identical for practical purposes), same alt text. | Both were cut from journey chapter 1. |
| A4 | The hero `<h1>` and the first section `<h2>` are **the same sentence** — „Vom Samen zum Öl." twice, ~600px apart. | Section list in `hof.astro` reuses the page title. |
| A5 | With no images, the `flip` alternation has nothing to alternate — text lands right / left / right for no visible reason. | Consequence of A1. |

### B. `/arbeit-mit-dem-pferd/` — one root cause drives most of the "huge images"

| # | Finding | Root cause |
|---|---------|-----------|
| B1 | **Every `aspect-ratio` rule on the page is dead.** `21/9` renders 1570×1066; `4/5` renders full height; the Kultur "small print" renders 340×1066 instead of 340×227. | Each `<img>` carries `width="1600" height="1066"`. HTML maps those to CSS `width`/`height` presentational hints. CSS `width:100%` beats the width hint, but nothing overrides `height:1066px` — and `aspect-ratio` is ignored whenever `height` is not `auto`. |
| B2 | **Horizontal overflow at 1920** (release blocker per CLAUDE.md). Cream sections show a stepped dark strip on their left edge and run past the right edge. | `.p-chapters` is offset `140px + var(--edge) + var(--gap-lg)` ≈ 284px for the rail, but `.chapter--kultur` / `.chapter--tempo` / `.waldkante` claw back only `var(--edge)` (64px) with `margin: 0 calc(-1 * var(--edge))`. |
| B3 | CTA eyebrow, headline and both buttons are **clipped off the left viewport edge**; the two buttons overlap. | Downstream of B2. |
| B4 | The **Zugleine draws straight through the hero photo and the `<h1>`**, and sits on top of the rail labels. | `.zugleine { top: 0; left: 190px }` — starts at document top, and 190px lands inside the rail's 64–204px band. |
| B5 | Boden's intended "image bleeds off the left viewport edge" **does not happen** — it reads as a stray 750×940 photo with a void beside it. | Same 284px offset as B2 swallows the negative margin. |
| B6 | Energie: dim cream body copy sits over **bright sunlit grass** — well below WCAG AA. | Scrim gradient reaches only 0.15 alpha at the text's vertical band. |
| B7 | No max-width anywhere. At 1920 the chapter grid spans ~1700px, leaving large dead voids beside 640px text columns. | No container. |
| B8 | Kreislauf's image bleeds off the **right** edge and is cut by the viewport — unintentional, mirrors nothing. | `grid-template-columns: 1fr auto` + B2. |

### C. Header dropdown

| # | Finding | Root cause |
|---|---------|-----------|
| C1 | Moving the cursor from "Der Hof" toward a submenu item **closes the menu**. | `.dropdown { top: 100%; margin-top: 14px }` creates a 14px gap that is outside both the trigger and the panel, so `:hover` drops. |
| C2 | The dropdown is hover/focus-only — no click or tap affordance, no `Escape`. | Not implemented. |

---

## 1 · Decisions taken (Russ, 2026-07-26)

1. **`/hof/` imagery** — use the real shoot photos wherever they exist; generate only what genuinely doesn't (the hero banner).
2. **`/hof/` hero** — new generated still **plus** a new headline (kill the duplicate sentence).
3. **Kutschenfahrten** — real harness/team photo. No invented carriage; nothing depicted that the farm doesn't own.
4. **Signature** — the Zugleine goes. Replaced by **„Die Furche"**: a scroll-driven WebGL soil furrow.
5. **Wide screens** — cap the content column, make the full-bleed sections genuinely full-bleed.

---

## 2 · Implementation phases

### Phase 1 — Global sizing (fixes B1 across the whole site)

- `global.css`: `img, video, canvas { display:block; max-width:100%; height:auto; }`
  A stylesheet rule always beats a presentational hint, so every `aspect-ratio` on the site starts working. Components that need a real height (`.p-hero-img`, `.chapter--energie .chapter-media`, `.p-vision-img`, `.p-cta-img`) already set `height:100%` explicitly and are unaffected.
- Audit every `<img width height>` pair against the file's true dimensions — several claim `1600×1066` for crops that aren't 3:2.
- **Verify:** re-run `qa/screenshot.mjs`; confirm the Kultur print is 340×227 and Tempo is 21:9.

### Phase 2 — `AmbientMedia` (fixes A1/A2)

- Poster `<img>` becomes the **layout-defining element in all cases**: rendered in normal flow, `<video>` layered absolutely on top and revealed only on `canplay`.
- Drop the dead `.mp4` paths from `site.ts` (set `src: null`) so no request 404s. The `src` prop stays supported, so loops can be dropped in later without touching markup.
- **Verify:** `qa/full-audit.mjs` — zero 404s on `/hof/` and `/`.

### Phase 3 — `/hof/` content

- **Hanf** → `galerie/ernte.webp` (hands cutting — matches „von Hand geerntet").
- **Pferd** → `ambient/horses.webp` (the real team ploughing).
- **Kutschenfahrten** → `ambient/harness.webp` (the real harness) — copy carries the offer.
- **Hero** → newly generated still (prompt in §4).
- **Hero headline** → „Der Hof hinter der Flasche." (alternates: „Ein Hof, der sich Zeit nimmt." / „Hanf, Pferde, Handarbeit.") Eyebrow „Das Hofkollektiv" and the existing sub-line stay. „Vom Samen zum Öl." survives only on the Hanf section, where it describes an actual process.
- Add `width`/`height` to each story image (correct values) so the reserved space is right and CLS stays at 0.

### Phase 4 — `/arbeit-mit-dem-pferd/` layout

- **Container system.** Introduce `--content-max: 1560px`. `.p-body` gets a centred inner container; the rail and chapters live inside it. Full-bleed elements (cream bands, Energie, Waldkante, Vision, CTA) move **out** of the offset container so `100vw` means `100vw`. This kills B2, B3, B5 and B8 together.
- **Boden** regains its real left bleed (image runs to the viewport edge, text stays in the column).
- **Kreislauf** loses the accidental right-edge cut; the small image stays small and deliberate.
- **Energie** scrim strengthened until body copy clears AA against the underlying photo; verified with a measured contrast check, not by eye.
- **CTA** re-checked at 1440 / 1920 / 390 for clipping and button wrap.
- Per-chapter image ceilings so no photo exceeds ~55vh of visual weight at 1920.

### Phase 5 — „Die Furche" (replaces the Zugleine)

**Concept.** A full-bleed band (~70vh) placed immediately after the Boden chapter — the page's thesis chapter. A dark soil plane; as it passes through the viewport, a furrow opens across it left to right, exactly the way a plough opens ground. Gold rim light rakes the ridge. Nothing else on the page moves.

**Build.**
- three.js, single plane (~160×48 segments), vertex displacement driven by one uniform `uProgress`.
- Palette locked: base `#0D1408`, ridge highlight toward `#F2EBDC` at low alpha, single directional light `#E8A33D`. No new hues, no gradient drift.
- `uProgress` scrubbed to the band's own scroll range via ScrollTrigger. **No pinning, no scroll-jacking** — the band scrolls at normal speed.
- Renderer capped at DPR 2, paused via IntersectionObserver when off-screen.
- **reduced-motion:** renders one static frame at full furrow depth.
- **JS-off:** the `<canvas>` is decorative and absent; a real soil photo poster sits behind it so the band is never empty.
- Payload: three.js core only (~140KB gz), no textures, no model files.

**Removed:** `zugleine` SVG, `buildZugleine()`, its resize handler, its four ScrollTriggers.

### Phase 6 — Header dropdown

- Replace `margin-top: 14px` with `padding-top: 14px` on `.dropdown` (transparent bridge — hover survives the gap), or a `::before` spanning the gap. Panel background stays where it is visually.
- Add click/tap toggle and `Escape` to close; `aria-expanded` on the trigger.
- **Verify:** scripted hover-path test (trigger → 14px gap → item) plus keyboard tab-through.

### Phase 7 — Verification (non-negotiable)

1. `npm run build` clean.
2. `qa/screenshot.mjs` at 1440 / 1920 / 390 for `/`, `/hof/`, `/arbeit-mit-dem-pferd/`, `/galerie/`, `/shop/`.
3. **Open and look at every PNG.** Written critique against this document — no silent acceptance.
4. `qa/scroll-stops.mjs` ≥16 stops on the pferd page (Furche draw position must match what's on screen at every stop).
5. `qa/full-audit.mjs` — zero console errors, zero 404s, after scroll and hover.
6. Explicit `document.documentElement.scrollWidth === innerWidth` assertion at 1920 on every changed route (overflow is a release blocker).
7. Measured contrast check on the Energie and Vision text bands.

---

## 3 · Order of work

Phase 1 → 2 → 3 (`/hof/` shippable) → 4 (pferd structurally sound) → 6 (header, independent) → 5 (Furche, last — it should land on a page that is already correct) → 7.

Phases 1, 2, 4 and 6 are pure bug-fixing and need no further input. Phase 3 waits on the generated hero image. Phase 5 is the only speculative craft work; if the Furche doesn't reach the bar in a first pass, the page still ships without it.

---

## 4 · Image generation prompt — `/hof/` hero banner

**Brief.** Must not repeat the homepage's sunrise-through-hemp-rows frame: different time of day, different lens, different subject relationship. Must read as *the collective at work*, not *the crop*. No buildings that would imply a specific farmyard we can't verify. Palette must land inside green-black / cream / gold with no cold or neon drift. 16:9, hero-safe: quiet lower-left third for the headline. Precedent: the four approved journey clips are Veo-generated and already ship, so generated atmosphere is established practice on this site — documentary photography and generated atmosphere just must not sit in the same frame.

```
A wide cinematic landscape photograph, late golden afternoon in rural Austria, low
warm side light raking across a harvested hemp field. In the middle distance, small
in frame and seen from behind, a pair of black draft horses in leather harness walk
a worn field track away from camera, a farmer walking beside them — figures kept
small and unidentifiable, no faces, no logos. Rolling hills and a dark treeline on
the horizon under a hazy amber sky. Shot on 35mm film, 50mm lens, deep depth of
field, natural grain, slightly lifted blacks. Colour palette strictly warm: deep
green-black shadows, dusty cream highlights, golden amber light — no blue cast, no
teal, no magenta. Muted, documentary, unhurried. Composition open and uncluttered
across the lower left third for text overlay. No text, no watermark, no lens flare,
no HDR look, no oversaturation.

Negative: people's faces, close-up portraits, cannabis leaf close-ups, dispensary
aesthetics, neon, blue hour, teal-orange grade, clinical white, modern tractors,
buildings, signage, text, watermarks.
```

**Post-generation checks before it ships:** no recognisable faces; no visible branding; the sky reads amber-not-pink; the lower-left third is quiet enough for a 5.5rem headline; grade sits inside the three brand colours; and it does not resemble `journey/poster.webp` in composition. Output at 1600×900, converted to `.webp` ≈ q60, saved as `public/media/hof/hero.webp`.

---

## 5 · Deliberately not doing

- **No generated Kutschenfahrten image.** No carriage photography exists; generating one would depict a vehicle — and possibly people — the farm may not own. Flagged for the client to supply a real photo.
- **No new ambient video.** The dead `.mp4` wiring stays supported but disabled; loops can drop in later.
- **No changes to the journey hero mechanic or `/galerie/`.** Both frozen per CLAUDE.md.
