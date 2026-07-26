# SONNWERK — Pass 2: proximity, crop discipline, image blending

*2026-07-26 · scope: `/arbeit-mit-dem-pferd/` + `/hof/` · continues `files/2026-07-26-hof-pferd-fix-plan.md`*

## 0 · Where we are

The earlier plan's **Phases 1–3 landed** (global `height:auto` so `aspect-ratio` works, `AmbientMedia` poster-first, `/hof/` real photography). **Phase 4 did not** — the pferd page still has no content cap and still uses the `float: left` rail with the `@media (min-width: 1001px)` negative-margin block. Everything Russ flagged in the 2026-07-26 screenshots traces back to that one gap, plus two image decisions.

Phases 5 (Furche) and 6 (header dropdown) from that plan are untouched and **out of scope here** — do not start them in this pass.

Evidence: Russ's five browser captures at 1920 (`/arbeit-mit-dem-pferd/` ×4, `/hof/` ×1) + source reading of `src/pages/arbeit-mit-dem-pferd.astro`, `src/pages/hof.astro`, `src/styles/global.css`.

---

## 1 · Findings

### The single root cause (drives shots 1, 2 and 3)

`.p-chapters` has **no max-width**:

```css
.p-chapters { margin-left: calc(140px + var(--edge) + var(--gap-lg)); padding-right: var(--edge); }
```

At 1920 that leaves a **1572px** content column. Every chapter grid then stretches while the text stays capped at 640px:

| Chapter | What 1572px does | What Russ saw |
|---|---|---|
| **Boden** | `1fr 1fr` + 80px gap → 746px columns; `aspect-ratio: 4/5` → a **932px-tall** photo. Text capped 640 inside a 746 column → 106px stranded. | Shot 1: a monumental plough photo beside four short paragraphs. |
| **Kultur** | `1.3fr 1fr` → a 499px right column holding a `max-width: 340px` print, `justify-self: end` → **159px of dead column**, and the whole area below the 340×227 print is void. | Shot 2: "a lot of white space and image placing is wrong." |
| **Tempo** | 21:9 image runs the full 1572px; text below is capped at `60ch` ≈ 660px, hard left → **~900px empty to its right**. Blockquote is capped at `22ch` so it wraps to 3 lines under a headline that runs 650px wide. | Shot 3: "text alignment and the positioning and a lot of white space." |

The cap is also why this is *resolution-dependent*: at 1440 the columns are ~1090px and it nearly works; at 1920 it falls apart. Any fix tuned per-chapter without a cap will break again at the next width.

### Rail proximity (shot 1)

```css
.p-rail { position: sticky; top: 96px; float: left; padding-top: 8px; }
.chapter { padding: clamp(64px, 10vw, 120px) 0; }
```

`.p-body` begins immediately after the 80vh hero, so at scroll 0 the first rail label paints **~8px below the hero's bottom edge** — it reads as attached to the hero. Meanwhile the first chapter's content starts ~120px lower, so the rail is also *orphaned above the content it indexes*. Two different spacings, neither deliberate. Sticky `top: 96px` additionally puts the rail flush against the fixed header once pinned.

### Energie image (shot 4)

`energie-*.webp` derives from `21-8Q3A9319.jpg` (grazing muzzle in tall grass). At 78vh full-bleed the head fills the frame and the **right edge cuts a second horse's body in half**. The photo is fine; the aspect box is not. Russ asked for a replacement rather than a re-crop.

### `/hof/` hard-edged photos (shot 5)

`.story .media` images are plain rectangles butted against flat cream / green-black. Nothing dissolves; the page reads as *photos placed on a background* rather than one surface.

### Two findings beyond the brief

- **Duplicate photograph across routes.** `/hof/`'s "Arbeit mit dem Pferd" section (`ambient/horses.webp`) and the pferd page's **Tempo** chapter are the same frame — `6-8Q3A8996.jpg`, mean per-pixel difference **19.2/255** between the two derivatives (i.e. the same shot, differently cropped). A visitor following the "Mehr dazu →" link meets the same picture twice.
- **Stale code comment.** `.chapter--energie .chapter-scrim` cites `qa/contrast-energie.mjs`; that file does not exist. The real script is `qa/contrast-check.mjs`. Fix the comment while you're in there.

---

## 2 · Decisions taken (Russ, 2026-07-26)

1. **Hero stays.** The half-face complaint was about **Energie**, not the hero. Do not touch `hero-*.webp` or `.p-hero`.
2. **Wide screens:** cap the content column (option A). Not per-chapter retuning.
3. **`/hof/` blending:** feathered edges **plus** a light palette tint. Not full duotone.
4. **Scope:** `/arbeit-mit-dem-pferd/` and `/hof/` only.

---

## 3 · Implementation

### Phase A — the container system (fixes shots 1, 2, 3 at every width)

New tokens in `global.css`:

```css
--rail-w: 140px;
--content-max: 1160px;   /* 640px text measure sits at ~55% — the page's existing rhythm */
--chapter-y: clamp(64px, 10vw, 120px);
```

Replace the `float: left` rail + the entire `@media (min-width: 1001px)` negative-margin block with a real grid:

```css
.p-body {
  display: grid;
  grid-template-columns: var(--rail-w) minmax(0, var(--content-max));
  column-gap: var(--gap-lg);
  justify-content: center;
  padding-inline: var(--edge);
}
@media (max-width: 1000px) {
  .p-body { grid-template-columns: minmax(0, 1fr); }
  .p-rail { display: none; }
}
```

The six per-chapter negative-margin overrides exist **only** to undo the float. They all go. Full-bleed sections (Kultur's cream band, Tempo, Energie, Waldkante) get one shared utility instead:

```css
.bleed { margin-inline: calc(50% - 50vw); }
.bleed-inner {
  max-width: calc(var(--rail-w) + var(--gap-lg) + var(--content-max));
  margin-inline: auto;
  padding-inline: var(--edge);
  padding-left: calc(var(--edge) + var(--rail-w) + var(--gap-lg));
}
```

so a full-bleed section's *text* still starts on the same vertical line as every chapter above it — the alignment discipline the page currently lacks.

> **Trap — do not use `overflow-x: hidden`.** `50vw` includes the scrollbar, so `.bleed` will overflow by ~15px. The reflex fix (`overflow-x: hidden` on a wrapper) **kills `position: sticky` on `.p-rail`**. Use `overflow-x: clip` on `body`, which does not create a scroll container. Then assert `document.documentElement.scrollWidth === innerWidth` at 1920 — overflow is a release blocker per CLAUDE.md.

Per-chapter geometry inside the 1160px column:

- **Boden** — `grid-template-columns: 1fr 1.15fr` → 500px image / 580px text. `aspect-ratio: 4/5` now renders 625px tall instead of 932px. Its left bleed is real again (image runs to the viewport edge via `.bleed`, text stays in the column).
- **Kultur** — `grid-template-columns: minmax(0, 640px) 320px; justify-content: space-between;` and drop `justify-self: end`. Offset the print down by `margin-top: clamp(48px, 6vw, 96px)` so its top edge aligns with the **paragraph**, not the eyebrow — that reads as a deliberately pinned print rather than a floating thumbnail. Remove `align-items: start`'s void by letting the section's own padding be the only bottom gap.
- **Tempo** — split the text into a real two-column row under the 21:9 image: `grid-template-columns: 0.85fr 1.15fr` with `column-gap: var(--gap-lg)` → blockquote left (~480px, 2–3 lines, reads as a pull-quote), paragraph right (~600px ≈ 60ch). Cap the `h2` at ~20ch so it stops outrunning the quote. Drop the `22ch` blockquote cap — the column now does that job.
- **Energie / Vision / CTA** — `.bleed` + `.bleed-inner`; text block capped at 640px, left edge on the content line.
- **Kreislauf** — verify the small image no longer bleeds off the right edge once the cap lands.

### Phase B — rail proximity

```css
.p-rail { padding-top: var(--chapter-y); top: 128px; }
.chapter { padding-block: var(--chapter-y); }
```

The rail's first label and the first chapter's eyebrow now share a top edge, and `top: 128px` gives the rail ~32px of air below the 96px header when pinned.

**Testable assertion, not an eyeball:** at 1440 and 1920, `|railFirstLabel.getBoundingClientRect().top − firstEyebrow.getBoundingClientRect().top| ≤ 2`. Add it to `qa/full-audit.mjs`.

Also check the 1000–1120px band, where the rail is live but the content column is at its tightest — the most likely new breakage.

### Phase C — Energie image replacement

Use **`assets-in/gate0/farm/13-8Q3A9263.jpg`** — the full team ploughing under open sky, sun raking across the hillside, man at the plough, deep landscape with real headroom.

Why it's the right frame: the chapter's argument is *grassland → work, dezentral und autark*, and this is the only frame in Gate 0 that shows the whole conversion happening in daylight. It's genuinely wide (no subject gets guillotined by a full-bleed box), and it's verified distinct from everything already on the site — mean per-pixel difference **82.6/255** vs `ambient/horses.webp`, versus 19.2 for the frame currently doing double duty.

- Update the map in `scripts/process-pferd-photos.py`: `'energie': '13-8Q3A9263.jpg'`, re-run it (webp at 1600/1000/640, q72).
- New alt: `„Das Pferdegespann zieht den Pflug über das sonnenbeschienene Feld"`.
- **The scrim must be re-derived.** The existing gradient was measured against a *dark* photo; `13-8Q3A9263` is high-key — bright sky, sunlit grass. The current stops (0.95 → 0.9 → 0.3 → 0.05) will not hold AA. Re-tune and **re-measure with `qa/contrast-check.mjs`**; do not accept it by eye. Expect to need a longer, deeper ramp or a dark plinth behind the text block.
- Fallback if the ploughing frame reads too close to Tempo's back-of-team shot: `assets-in/gate0/farm/8Q3A5975-scaled.jpg` (hemp rows, man with scythe, sunlit hillside) — literally the chlorophyll line in the copy, but arguably off-topic on a horse page. Decide from the screenshot, not in advance.
- While here: note the `/hof/` ↔ Tempo duplicate in `LOG.md` as an open item. Not fixed in this pass.

### Phase D — `/hof/` image blending

Three layers, all CSS, no new assets.

**1 · Feathered edges** on `.story .media img`:

```css
--feather: clamp(20px, 4vw, 64px);
mask-image:
  linear-gradient(to right,  transparent, #000 var(--feather), #000 calc(100% - var(--feather)), transparent),
  linear-gradient(to bottom, transparent, #000 var(--feather), #000 calc(100% - var(--feather)), transparent);
mask-composite: intersect;
-webkit-mask-composite: source-in;
```

**2 · Palette tint** — pull the cast toward green-black/gold without killing the subject:

- `filter: saturate(0.82) contrast(1.04)` on the image
- `.media::after` — a low-opacity `--gold` wash at `mix-blend-mode: overlay`, ~0.3
- `.media::before` — a `--bg` wash at `mix-blend-mode: multiply`, ~0.12, to deepen shadows into the palette

Tune by screenshot. The hemp and the horses must keep their natural colour reading — if they go muddy, back the opacities off. Blend modes only, no new hues.

**3 · Grain** — nothing to build. `.grain::after` is already `position: fixed` over the full viewport at 0.05, so it already runs continuously across photo and page. Confirm it isn't being clipped by any new stacking context the masks introduce.

Fallbacks: wrap in `@supports (mask-composite: intersect)` so unsupported browsers get today's hard rectangle. At ≤800px, where images go full-width, drop `--feather` to its 20px floor so subjects aren't eaten at the edges.

> **Do not apply this to the pferd page's `.chapter-media`.** Those elements already animate `clip-path` for the masked reveal; adding a static `mask-image` to the same element makes two masks fight. If the treatment is wanted there later, feather the **wrapper** and animate `clip-path` on the **inner** element.

---

## 4 · Order of work

A → B → C → D. A and B are one edit in practice (the container rewrite is what makes the rail alignment expressible). C is independent and can be done in parallel. D touches only `hof.astro`.

---

## 5 · Verification (non-negotiable, per CLAUDE.md)

1. `npm run build` clean, inside `site/`.
2. `node qa/screenshot.mjs` — `/arbeit-mit-dem-pferd/` and `/hof/` at **390 / 1024 / 1440 / 1920**, plus a spot check at **1100** (rail live, column tightest).
3. **Open and look at every PNG.** Written critique against §1's table — each of the five reported symptoms named and confirmed gone. No silent acceptance.
4. `document.documentElement.scrollWidth === innerWidth` asserted at 1920 on both routes.
5. Rail/eyebrow baseline assertion (§Phase B) passing at 1440 and 1920.
6. `qa/contrast-check.mjs` on the new Energie band — AA or it doesn't ship.
7. `node qa/full-audit.mjs` — zero console errors, zero 404s, after scroll and hover.
8. `node qa/scroll-stops.mjs` — the masked `clip-path` reveals still fire on the pferd page after the container rewrite (the reveal triggers were killed by a resize handler once before; see `LOG.md` 2026-07-25).
9. Payload guard still under the 2.5MB/route cap after the Energie swap.

Do not claim a pass on anything not seen in a screenshot from the same session.

---

## 6 · Deliberately not doing

- **No Phase 5 (Furche) or Phase 6 (header dropdown)** from the previous plan — separate pass.
- **No hero change** on either page.
- **No new generated imagery.** Every frame in this plan is a real photograph already in `assets-in/`.
- **No fix for the `/hof/` ↔ Tempo duplicate frame** — logged, deferred, needs a photo decision.
- **No changes to the journey hero mechanic or `/galerie/`** — frozen per CLAUDE.md.
