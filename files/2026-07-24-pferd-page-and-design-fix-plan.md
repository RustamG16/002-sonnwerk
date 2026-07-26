# SONNWERK lab/002 — Design-Fix + `/arbeit-mit-dem-pferd` build plan
Date: 2026-07-24 · Author: design pass (planning only, no code written)
Scope: (A) defect audit + fixes at 1440/1920/390, (B) the broken section in the screenshot, (C) improvement proposals, (D) a new Awwwards-grade `/arbeit-mit-dem-pferd` page, (E) content status + scrape decision, (F) execution phases for Claude Code.

> **Status of source content: no scraping needed.** The live page was opened and read in-browser on 2026-07-24 (DOM + screenshots at 1568px). All copy is captured verbatim in Appendix A, including the „Pferdevision" text that exists only as pixels inside a JPEG. All 9 photos it uses are already in `assets-in/gate0/horse/` — except one background (`Vision-scaled.jpg`), which is a single `curl` away (§E2).

---

## A. Defect audit (static, from source — every item must be **confirmed and re-shot** in the Playwright loop per CLAUDE.md §Verification)

Severity: **BLOCKER** = violates a CLAUDE.md hard rule or breaks a release gate · **HIGH** = visible design failure · **MED** = craft/a11y debt.

| # | Sev | Where | Defect | Fix |
|---|-----|-------|--------|-----|
| D1 | HIGH | `index.astro:111–134`, `global.css:65` | **The section in the screenshot.** `.galerie-teaser` and `.quote` are two adjacent `.paper-section`s that each carry `padding: var(--section-y) 0` (=160px at ≥1140px wide). They render as one undifferentiated cream field with a ~320px dead void between the thumbs and the blockquote. Compounding it: `.galerie-teaser .inner { align-items: center }` centres the text column against a 2-row thumb stack, so the right column floats with empty space under the button. | See §B — merge into one cream act, single padding, hairline rule, art-directed quote. |
| D2 | BLOCKER | `global.css:73`, `Base.astro` | `.reveal { opacity: 0 }` is **unconditional** and there is **no inline `html.js` script** in `Base.astro`. With JS off (or if GSAP fails to load) every revealed element on every page is invisible. CLAUDE.md: "Elements hidden for scroll reveals must be hidden only under `html.js`". | Add `<script is:inline>document.documentElement.classList.add('js')</script>` as the first thing in `<head>`; scope to `html.js .reveal { opacity: 0; … }`. |
| D3 | BLOCKER (1920) | `Header.astro:51`, `index.astro:169`, `global.css:34` | **Three different left edges at 1920.** Header `.bar` uses `padding-inline: clamp(20px,4vw,64px)` → 64px; journey `.hero-copy` uses `padding: 0 clamp(24px,8vw,120px)` → 120px; body sections use `.wrap` max-width 1240 → 340px. CLAUDE.md calls misaligned edges at 1920 a release blocker. | One layout contract: `--wrap: 1240px`, `--edge: clamp(20px,4vw,48px)`; header bar and hero copy hang on the same left edge as `.wrap` (or widen `--wrap` to 1440 and align all three). Verify with a 1920 screenshot + a vertical guide overlay. |
| D4 | HIGH | `global.css` (absent) | No `:focus-visible` styling anywhere. Keyboard users get the UA default (or nothing on `.btn`, which resets nothing but sits on cream). WCAG 2.4.7. | Global `:focus-visible { outline: 2px solid var(--gold); outline-offset: 3px }` + a `.skip-link`. |
| D5 | HIGH | `global.css:16`, `Header.astro:50` | Fixed 72px header + `scroll-behavior: smooth`, but **no `scroll-padding-top`** → any `#anchor` target lands under the header. Blocks the chapter index on the new page and the existing `/hof#pferd` links. | `html { scroll-padding-top: 96px }`; and when Lenis is active use `lenis.scrollTo(el, { offset: -96 })`. |
| D6 | MED | `index.astro:122`, `hof.astro:51` | Cream-section buttons are patched with inline `style="border-color:#0D1408;color:#0D1408"`. The inline `color` also outranks `.btn:hover`, so hover state is accidental, not designed. | `.btn--ink` modifier in `global.css`, with its own hover (ink fill, cream text). Remove both inline styles. |
| D7 | MED | `scripts/reveal.js` | Dead file — never imported (`Base.astro` loads `header/cart/motion` only). Two competing reveal systems is a latent bug. | Delete `reveal.js`, or make it the documented no-GSAP fallback and load it conditionally. Pick one. |
| D8 | MED | `global.css:69` vs `Header.astro:50/119`, `CartDrawer.astro:21` | `.grain::after` sits at `z-index: 90` — above the header (50) and the mobile nav (60), below the cart drawer (98). So grain veils navigation text but not the drawer: inconsistent. | Grain to `z-index: 45` (above media, below all UI). Re-shoot the header on a cream section to confirm no muddiness. |
| D9 | HIGH | `site.ts:43`, `index.astro:240–244` | Catalog has **5** categories; the live shop has **7** (Tee and Merch missing). `.grid-bento` hard-codes five explicit `grid-column/grid-row` slots, so adding a category silently breaks the bento at 1440 and 1920. | Restore Tee + Merch, and rewrite the bento as `grid-auto-flow: dense` with `--span` classes so N items can't break the layout. Verify at all three widths. |
| D10 | MED | `index.astro:249` | `.cat--oel .media { aspect-ratio: auto; height: 100% }` inside a 2-row grid span — at 1920 the tile can grow taller than the source crop wants; risk of stretch/letterbox. | Confirm in the 1920 PNG; if stretched, give the featured tile a fixed `aspect-ratio: 4/5` and let the grid rows follow it. |
| D11 | HIGH | `hof.astro:36–45` | All three `/hof` chapters use one identical `.story` template (image ↔ text, alternating). Reads as a CMS loop, not art direction. This is exactly the failure the new page must not repeat. | Out of scope for this pass except: `/hof` "Arbeit mit dem Pferd" gains a `Mehr dazu →` deep link to the new page. Full `/hof` rebuild stays in `CLAUDE-AWWWARDS-PROMPT.md` §D1. |
| D12 | MED | `index.astro:289` | `.trust-inner` is a 5-column grid (`1fr auto 1fr auto 1fr`) that only collapses at ≤800px. Between ~800 and ~1100 the three 280px copy blocks plus two rules get cramped. | Add a 1100px breakpoint → 3 columns without rules, or `auto-fit, minmax(240px, 1fr)`. Verify at 1024. |
| D13 | MED | `Base.astro:24` | Fraunces is loaded as a variable font but no `font-variation-settings` is used. Display headlines at 5.5rem render with text-optimised optical sizing → flat, generic serif. | `h1, h2, .display { font-variation-settings: 'opsz' 144, 'SOFT' 30, 'WONK' 1 }`; body-size serif stays `opsz 14`. Cheapest single upgrade in the whole audit. |
| D14 | MED | `global.css:16` + `motion.js:13` | `scroll-behavior: smooth` fights Lenis on non-journey pages (two smoothing engines on the same anchor click). | `html { scroll-behavior: auto }` when `html.js` and Lenis is active; route anchors through `lenis.scrollTo`. |
| D15 | MED | 390px | `.galerie-teaser .thumbs` stays a 2-column grid with a row-spanning first image at 390 — thumbs shrink to ~150px. | 390: single column, two images max, `aspect-ratio: 3/2`. Confirm in the mobile PNG. |
| D16 | MED | site-wide | No 404 page. | Branded `/404` (dark, one Fraunces line, link back to Shop and Hof). |

**Not defects, verified intentionally correct:** parallax + reveals are `prefers-reduced-motion` gated (`motion.js:8,22,47`); the meter HUD is hidden ≤767px; the journey static fallback exists (`index.astro:183–188`); QA scripts already cover 1440/1920/390.

---

## B. The section in the screenshot — the actual fix

**Diagnosis:** it is not a broken image or a layout overflow. It is two consecutive cream sections each paying full `--section-y` padding, with nothing between them to justify the space. The eye reads it as a rendering failure, not as air. The teaser's own composition is also weak: three thumbs in a centred 2-col block with no crop hierarchy, and a right column that stops halfway.

**Fix — treat teaser + quote as one cream act ("Das Blatt"), not two sections:**

```
┌ paper act ─────────────────────────────────────────────────┐
│  GALERIE                                                   │
│  Der Hof in Bildern.        ▓▓▓▓▓▓▓▓  ▓▓▓▓                 │  ← thumbs top-aligned to the
│  Feld, Pferde, Handarbeit …  ▓▓▓▓▓▓▓▓  ▓▓▓▓                 │    cap-height of the H2, 3 crops
│  [ GALERIE ÖFFNEN ]          ▓▓▓▓▓▓▓▓  ▓▓▓▓▓▓▓▓             │    at 3 different ratios
│ ─────────────────────────── gold hairline ──────────────── │  ← the only divider
│              „ Man schmeckt, dass da ein Hof                │
│                dahintersteht und kein Labor. "              │  ← 60–70ch measure, mark
│                             — Kundin aus Kärnten            │    behind, not centred-floating
└────────────────────────────────────────────────────────────┘
```

1. Wrap both in one `<section class="paper-act">` with `padding: var(--section-y) 0` **once**; inner blocks use `--gap-lg`, not section padding.
2. Belt-and-braces rule regardless: `.paper-section + .paper-section { padding-top: 0 }` (specificity 0,2,0 beats `.quote`) so this class of void can't reappear elsewhere.
3. `.galerie-teaser .inner { align-items: start }` and give the text column a `padding-top` that optically aligns the eyebrow with the first thumb's top edge.
4. Thumbs: three deliberate crops (tall 3/4 · square · wide 16/9) in a staggered 2-column grid instead of three identical 4/3 boxes; keep the ±24px parallax, add a mask reveal.
5. Hairline `1px solid rgba(13,20,8,0.14)` full `.wrap` width between the two blocks — that line is what makes the remaining space read as intentional.
6. Quote: left-aligned to the same edge as everything else at 1920, `max-width: 20ch` on the serif, `„` mark set at 0.10 opacity behind the first line, author on a gold hairline. Kinetic per-line rise on scroll (`once`).
7. 390: teaser stacks (text → 2 thumbs), quote drops to 2.2rem, act padding to 80px.

**Acceptance:** 1440/1920/390 PNGs of the act; no gap taller than `--section-y`; the hairline and the quote's left edge share an x-position with the H2 above them.

---

## C. Proposed improvements (beyond fixing)

- **P1 — Header theme inversion.** The header is a dark slab pinned over cream sections (visible in the screenshot, where it clips „Der Hof in Bildern"). Add an IntersectionObserver that swaps the header to cream/ink when a `.paper-section` crosses under it. Fixes legibility and removes the "sticky bar cutting a headline" look on every cream page.
- **P2 — One rule system.** A single gold/ink hairline vocabulary (section dividers, author rules, trust rules, footer) instead of ad-hoc `.trust-rule`. Cheap, makes the whole site look composed.
- **P3 — Masked image reveals** (`clip-path: inset(0 0 100% 0)` → 0, 900ms, `once`) replacing uniform fade-up on all media; text keeps line-rises. This is the single biggest "art-directed vs template" signal in the audit.
- **P4 — Optical-size typography** (D13) plus a real fluid scale with a defined ratio, not per-component `clamp()` guesses.
- **P5 — `.btn--ink` + magnetic hover** on cream sections (removes D6 and gives cream CTAs a designed state).
- **P6 — Deep-link the `/hof` chapters** to the new provenance pages (`/arbeit-mit-dem-pferd/`, later `/unser-hanf/`, `/kutschenfahrten/`) so `/hof` becomes an index of real depth rather than three paragraphs.
- **P7 — Keyboard + 404 pass** (D4, D16) — Awwwards juries check tab traversal.
- **P8 — Payload guard in `full-audit.mjs`:** fail the audit if any route ships >2.5MB of non-journey imagery. The new page adds 8 photos; without a guard it will quietly become the heaviest route.

---

## D. New page — `/arbeit-mit-dem-pferd/`

### D0a. What the live page actually is (inspected in-browser, 2026-07-24)

Structure (Divi, 6 sections): full-bleed hero **band** 450px tall (`69-8Q3A9873.jpg` as a CSS background, letterboxed) → centred rustic display headline „Warum echte Pferdestärken?" on white, then ~200px of empty white → 2-column block (BODEN | KULTUR) → 3-column block (TEMPO | ENERGIE | KREISLAUF) → full-bleed forest strip (`111-…`, 2048×215) → „Das Pferdvolle an Sonn'Werk" → image-left/text-right (HANDWERK) → full-width photo → the same forest strip again → „Pferdevision" → a photo with the manifesto **burned into the JPEG**. Then the footer. No CTA anywhere.

What to keep, what to kill:

- **Keep (client's own idiom, worth reinterpreting):** the full-bleed horizontal strip as a chapter divider; the question as the page's opening line; the proverbs; the two-part rhythm (arguments → manifesto).
- **Kill:** justified body text (rivers and gaps in every column); ~200px of unexplained white between the headline and the first chapter (the same defect class as D1 on our homepage); three columns of equal-weight text with no hierarchy — six arguments arriving at identical size means none of them lands; the letterboxed hero that crops the best photo on the page to a 4.3:1 sliver; the dead-end ending.
- **Fix as a matter of principle:** the „Pferdevision" manifesto is **text inside an image** — unselectable, unsearchable, unreadable on a phone, invisible to screen readers, and it sits on a bright sky with no scrim. It becomes real text in our build. This is the single clearest "we made this better" moment on the page.
- **Art-direction note:** these horses wear red-and-white browbands, and that red recurs in almost every frame. It is the only non-brand colour on the page and it is doing real work. It stays **in the photography only** — never lifted into UI, per the locked palette. Crop to feature it.

### D0. Brief
**Subject:** horse-drawn field work at the SONNWERK Hofkollektiv. **Audience:** AT/DE buyers 30–60 who already suspect "bio" is a label, plus horse people. **The page's one job:** make "Pferd statt Traktor" land as a costly, deliberate, still-practised craft — and hand the reader onward to Kutschenfahrten and the Shop. **URL:** keep `/arbeit-mit-dem-pferd/` (SEO parity with the live page).

### D1. Direction
Palette, faces and grain are locked by `brandspec.json`, so the distinctiveness has to come from **structure, type scale and one signature**, not from a new look. Everything below is derived from the page's own subject matter.

**Signature — „Die Zugleine" (the trace line).**
One continuous gold hairline enters at the hero from the harness in the photo and runs the entire page: it is the line between horse and plough. Implementation: a single fixed SVG path, `stroke-dasharray`/`dashoffset` scrubbed to scroll progress (GSAP ScrollTrigger, no pinning, no scroll-jacking). Its behaviour encodes the argument:

- taut and straight through BODEN / KULTUR,
- it **slackens into a curve** at TEMPO (the chapter about not hurrying) — the one moment the line disobeys the grid,
- it splits into two strands at KREISLAUF (the cycle chapter) and rejoins,
- it hitches to the final CTA like a rein tied off.

This is the only bold move on the page. Everything else stays quiet. Reduced-motion: the path renders fully drawn, static. JS-off: the SVG is inert decoration, `aria-hidden`, and the page reads as a normal document.

**Why not numbered chapters (01/02/03):** the six arguments are parallel reasons, not a sequence — numbering them would assert an order the content doesn't have (and it's the default AI move). Instead each chapter carries a **domain tag**, which is true information: `BODEN · KULTUR · TEMPO · ENERGIE · KREISLAUF · HANDWERK`. Those same six tags become a sticky left-rail index that highlights on scroll. Left rail, not right — the right edge stays reserved sitewide for the journey scrub HUD, so the two devices never get confused.

**Type:** Fraunces at `opsz 144, WONK 1` for chapter titles (clamp 2.8→5rem); the two real proverbs get the largest setting on the page (clamp 2.2→4rem, cream act, generous measure); Space Grotesk 0.72rem / 0.3em tracking for tags and the rail. No third face.

**Rhythm — no two chapters share a template:**

```
HERO        dark · FULL-FRAME (not letterboxed) 69-…, man + horse muzzle to muzzle.
            Fraunces: „Warum echte Pferdestärken?" bottom-left on the wrap edge.
            The Zugleine starts at the rein in the photo.
BODEN       dark · the plough-in-soil photo bleeds off the LEFT viewport edge; text on the grid
KULTUR      cream · text-forward; the harness-buckle macro set small, like a pinned print, with
            a hairline caption — the chapter about knowledge passed hand to hand gets the
            smallest, most detailed image on the page
TEMPO       cream · the widest, quietest frame on the page + only the proverb and one paragraph.
            The Zugleine goes slack here. The air IS the argument — deliberate, unlike D1's void.
ENERGIE     dark · text set OVER the grazing-horse frame, slow ken-burns, gold vignette
KREISLAUF   dark · the hoof-and-dung frame small and unglamorous, text large beside it — the
            page's driest, most matter-of-fact chapter (its content is literally manure)
[WALDKANTE] the 2048×215 forest strip, full-bleed, ONCE (the live page uses it twice) →
            „Das Pferdvolle an SONNWERK"
HANDWERK    dark · the barn-interior portrait, high contrast, + the Leidenschaft proverb at the
            page's largest type
PFERDEVISION cream · the manifesto AS REAL TEXT over the Vision frame with an ink scrim —
            the moment we visibly beat the original
CTA         dark · Kutschenfahrten (inquiry) + Zum Shop; the Zugleine ties off here
```

### D2. Image map — every photo assigned to the argument it actually depicts
(All in `assets-in/gate0/horse/` at 2048×1365 except where noted.)

| Slot | File | Why this one | Treatment |
|------|------|--------------|-----------|
| Hero | `69-8Q3A9873.jpg` | the live hero, but cropped there to a 450px letterbox | full-frame 80vh, dark grade + gold vignette |
| BODEN | `17-8Q3A9285.jpg` | plough blade in open soil — the compaction argument, literally | bleeds off the left viewport edge, 4/5 |
| KULTUR | `51-8Q3A9679.jpg` | harness/buckle macro — knowledge in the hands | small pinned print ~420px, 3/2, caption rule |
| TEMPO | `6-8Q3A8996.jpg` | man walking behind the team on a track — pace made visible | widest frame on the page, 21/9, generous air |
| ENERGIE | `21-8Q3A9319.jpg` | horse grazing — sun → grass → traction, the whole argument in one frame | full-bleed background, text over |
| KREISLAUF | `59-8Q3A9806.jpg` | hoof and dung on sand — biodünger, unvarnished | small, unglamorous, text-dominant |
| Waldkante | `111-8Q3A0067-e1615927311231.jpg` (2048×215) | the client's own divider idiom | full-bleed strip, used **once** |
| HANDWERK | `65-8Q3A9853.jpg` | barn interior, man in hat — craft, low key | high-contrast dark chapter |
| Pferdevision | `Vision-scaled.jpg` (**not yet local**, §E2) | the closing manifesto frame | ink scrim + real text over it |
| Reserve | `9-8Q3A9182.jpg` | man and horse, the emotional peak | CTA background, or cut per Chanel rule |

**Ingest:** WebP at 1600 / 1000 / 640 widths, q72, into `site/public/media/pferd/`; `loading="lazy"` below the hero; explicit `width`/`height` on every `<img>`. Target ≤1.6MB for the whole route. Photo credit „Fotos: Apollonia T. Bitzan" in the footer (already in the Awwwards prompt §F4).

### D3. Copy
German, Du-Ansprache, **verbatim from the live page** (Appendix A) with only these edits: normalise `Sonn` Werk` → `SONNWERK`, fix the typo `verurteil` → `verurteilt`, straighten quotes to `„ "`. New copy is limited to connective tissue (hero sub, tags, CTA lines) — no invented facts, no medical claims, no numbers that aren't on the live site. The soil-compaction argument stays qualitative unless a real sourced figure is supplied.

### D4. Wiring
- `Header.astro`: `Der Hof` becomes a small dropdown (Der Hof · Arbeit mit dem Pferd · Galerie) — desktop hover/focus, mobile expands in the overlay.
- `hof.astro` `#pferd` chapter: `Mehr dazu →` link.
- Footer: link in the Hof column.
- `sitemap`/JSON-LD: `Article` schema, `og:image` = hero WebP.
- QA: add `/arbeit-mit-dem-pferd/` to `qa/screenshot.mjs` routes and to `qa/scroll-stops.mjs` (≥16 stops).

---

## E. Content status & the scrape question

### E1. Already in hand — no scrape needed (verified in-browser 2026-07-24)
- **Body copy:** all six chapter headings + paragraphs + both proverbs captured verbatim (Appendix A).
- **Images:** all 8 live-page photos present in `assets-in/gate0/horse/` at 2048px, plus one spare (`69-8Q3A9873.jpg`).
- **Meta:** title `Arbeit Mit Dem Pferd | SONNWERK - Natur Die Wirkt`, description „Warum echte Pferdestärken?", canonical `https://sonn-werk.at/arbeit-mit-dem-pferd/`.
- **Nav/footer facts:** category list (7 incl. Tee + Merch), Instagram `@hofkollektiv_sonnwerk`, Facebook, photo credit, Austria Bio-Garantie, shipping partner Weship, "Alle Preise inkl. 20% MwSt."

- **Sections:** 6 Divi sections mapped with heights and backgrounds (§D0a). Both "missing" blocks are resolved: „Das Pferdvolle an SONNWERK" is a heading only (no hidden body copy), and „Pferdevision" is a heading plus text baked into `Vision-scaled.jpg` — transcribed in Appendix A.
- **Images:** all `alt` attributes on the live page are empty. Our build writes real German alt text (see §D3).

### E2. The only missing asset — one image, one command
`https://sonn-werk.at/wp-content/uploads/2021/03/Vision-scaled.jpg` → save to `assets-in/gate0/horse/`. It is the background of the closing manifesto. Note it has the paragraph rendered into the pixels; our page must use it **as photography only** and set the text in HTML on top, so pick a crop that avoids the baked-in words (they sit in the upper-left third).

### E3. Optional — sibling pages, only when you build them
Nothing needs scraping for `/arbeit-mit-dem-pferd/`. If and when `/unser-hanf/` and `/kutschenfahrten/` get the same treatment, this prompt collects them in one pass:

**Cursor prompt (copy-paste):**

> Write a one-off Playwright script `scripts/scrape-hof-pages.mjs` in `lab/002-sonnwerk/`. It must:
> 1. Launch chromium headless, `page.goto` each of `https://sonn-werk.at/kutschenfahrten/` and `https://sonn-werk.at/?page_id=26570` (Unser Hanf) with `waitUntil: 'networkidle'`, viewport 1440×900.
> 2. Before extracting, expand all Divi interactive content: click every `.et_pb_toggle_title`, `.et_pb_tab_nav li a`, and `.et-pb-arrow-next` (loop the slider until the first slide repeats), waiting 400ms after each click.
> 3. Extract, in DOM order, into `files/scraped/<slug>.json`: `{ url, title, metaDescription, blocks: [{ type: 'heading'|'paragraph'|'quote'|'image'|'list', level, text, src, alt, title, caption }] }`. Preserve German characters and typographic quotes exactly; do not reflow or summarise text.
> 4. Download every `wp-content/uploads` image referenced on those pages — **including CSS `background-image` URLs on `.et_pb_section`, not just `<img>` tags** (the hero on the sibling pages is a background, as it is on `/arbeit-mit-dem-pferd/`) — at its largest available variant into `assets-in/gate0/hof-extra/`, skipping files already present under `assets-in/gate0/`. Log skips.
> 4b. Flag any section whose visible paragraph text is absent from `innerText` — on this site that means the copy is baked into a JPEG and must be transcribed by hand.
> 5. Also capture full-page screenshots at 1440 and 390 into `files/scraped/<slug>-{1440,390}.png` — reference only, never shipped.
> Do not modify any file under `site/`. Print a summary table of blocks and images per page when done.

---

## F. Execution plan for Claude Code

Run from `lab/002-sonnwerk/`, start in plan mode. `CLAUDE.md` verification protocol governs every phase: **one section per screenshot round, open and look at the PNGs, cite a screenshot for every claim, no self-scores without evidence.** This plan slots in ahead of `CLAUDE-AWWWARDS-PROMPT.md` §D — it does not replace it.

**Phase 0 — Baseline (no design changes).**
`npm i -D playwright && npx playwright install chromium` in `site/`; expose `window.__lenis`; shoot every route at 1440/1920/390 plus 16-stop scroll series of `/` and `/hof` into `qa/screenshots/baseline/`. Output: `docs/awwwards/AUDIT.md` confirming or refuting D1–D16 with PNG citations. **Any item in §A that the screenshots contradict gets struck from the plan, not silently fixed.**

**Phase 1 — Foundation fixes (invisible-but-blocking).** D2 (`html.js`), D3 (one left edge), D5 (`scroll-padding`), D4 (`:focus-visible` + skip link), D14 (smooth-scroll conflict), D7 (dead file), D8 (grain layer). Acceptance: JS-off screenshot of `/` shows all content; 1920 screenshot with a guide overlay shows header, hero copy and body sharing one left edge; Tab traversal capture.

**Phase 2 — The screenshot section (§B).** One section, one round. Acceptance: the three PNGs from §B.

**Phase 3 — Homepage defects.** D9 (Tee + Merch, resilient bento), D10, D12, D15, D6 (`.btn--ink`), D13 (optical sizing). Acceptance: before/after pairs at all three widths; no overflow-x at 390.

**Phase 4 — Asset ingest for the new page.** WebP derivatives per §D2 into `public/media/pferd/`; payload table before/after; P8 guard added to `full-audit.mjs`.

**Phase 5 — `/arbeit-mit-dem-pferd/`.** Build in this order, screenshotting between each: (a) page shell + real copy, no motion — verify it reads as a document; (b) chapter layouts one at a time; (c) sticky tag rail; (d) the Zugleine signature; (e) masked reveals (P3); (f) CTA + wiring (§D4). Acceptance per chapter: 1440 + 390 PNG, and a written answer to "would this read as art-directed or as template?". Acceptance for the Zugleine: a 16-stop scroll series showing the line mid-draw, slack at TEMPO, split at KREISLAUF — **not just start and end states**.

**Phase 6 — Improvements.** P1 (header inversion), P2 (rule system), P6 (deep links), P7 (404).

**Phase 7 — Final verification.** Clean `npm run build`; full `qa/screenshot.mjs` + `scroll-stops.mjs` (journey, `/hof`, `/arbeit-mit-dem-pferd`) + `full-audit.mjs` with zero console errors and zero 404s after scroll and hover; reduced-motion emulation pass; JS-off pass; keyboard pass; grep for hex values outside the three tokens; payload table. Re-grade the rubric **only** from Phase 7 screenshots. `docs/awwwards/WORKLOG.md` current.

**Definition of done:** every D-item either fixed with a cited screenshot or struck in `AUDIT.md` with a reason; the new page passes its per-chapter and Zugleine acceptance checks; nothing claimed that a PNG doesn't show.

---

## Appendix A — verbatim copy, `/arbeit-mit-dem-pferd/` (retrieved 2026-07-24)

**Page title:** Arbeit Mit Dem Pferd | SONNWERK - Natur Die Wirkt
**Meta description / hero line:** Warum echte Pferdestärken?

**1 — BODEN · „Unser Boden wird es uns danken!"**
Proverb: „Jeder Mensch lebt von einem Stückchen Erde"
Daher sollte es für uns alle an oberster Stelle stehen, unsere Mutter Erde vital und lebendig zu halten. Bodenverdichtung, ein gestörter Wasserhaushalt und ein Mangel an Bodenleben sind unter Anderem große Probleme unserer modernen, maschinellen Arbeitsweise. Beim Hofkollektiv SONNWERK setzen wir deshalb auf's richtige Pferd.

**2 — KULTUR · „Erhalt von Kulturgut"**
Es gibt Wissen, dass man nicht durch Worte oder Videos vermitteln kann. Jenes wird lediglich in der Praxis von einer Generation an die nächste weitergegeben und wird dadurch zu einem Teil unserer Lebensart und Kultur. Zu dieser Art von Wissen zählen viele unserer bäuerlichen Tätigkeiten, so auch das richtige Arbeiten mit Pferden. Wir bei SONNWERK wollen einen wichtigen Beitrag dazu leisten, dass uns dieses Wissen nicht unwiederbringlich verloren geht.

**3 — TEMPO · „Menschgerechtes Arbeitstempo"**
Proverb: „Die Ruhe sei dem Menschen heilig, nur die Dummen haben's eilig"
Die Verbindung, welche ein wahrer Bauer mit seinen Tieren eingeht, ist für Außenstehende kaum zu begreifen. Es ist die tagtägliche Fürsorge und Beschäftigung mit ihnen, die dafür sorgt, dass sich die Rhythmen von Mensch und Tier aufeinander abstimmen. Wenn man mit Pferden im bäuerlichen Sinne arbeitet, macht man auch die Pausen mit seinen Arbeitspartnern gemeinsam. Und auch die Rösser schauen am Ende des Tages voll Stolz auf ihr Tagwerk!

**4 — ENERGIE · „Nachhaltige Solarenergie"**
Die Energie, welche uns die Sonne Tag für Tag schenkt, stellt die Basis unserer irdischen Existenz dar. Unsere Natur hat mittels Chlorophyll haltiger Geschöpfe den idealen Weg gefunden, diese Energie zu verwerten und in weiterer Folge allen weiteren Lebensformen zur Verfügung zu stellen. Daher ist das Pferd, als Teil der Natur, im perfekten Maße in der Lage, Grünland in Arbeitskraft umzuwandeln und das völlig dezentral und autark!

**5 — KREISLAUF · „Biodünger statt Treibhausgase"**
Es sind die immer wiederkehrenden Kreisläufe in der Natur, die für den Fortbestand des Lebens sorgen. Dabei bedingt das eine meist das andere, wobei jene nicht getrennt voneinander existieren können. Ein gutes Beispiel dafür ist das Verhältnis von Weidetier zu Grasland. Alles was sich nicht innerhalb dieser Logik bewegt, wie etwa unsere erdölabhängige Wirtschaftsweise, ist auf kurz oder lang zum Scheitern verurteilt. Die Folgen davon können wir alle bereits im Hier und Jetzt spüren.

**Divider heading:** Das Pferdvolle an SONNWERK *(heading only — no body copy exists on the live page)*

**6 — HANDWERK · „Präzision und Leidenschaft"**
Proverb: „Erst die Leidenschaft macht einen Beruf zur Berufung"
Und es gehört schon eine ganze Menge Leidenschaft und Wille zum Lernen dazu, um sich dem Thema Arbeitspferd voll und ganz hinzugeben, wenn die maschinellen Möglichkeiten einen dermaßen zu Komfort und Bequemlichkeit verleiten. Es ist einfach eine überwältigende Zufriedenheit, die man verspürt, wenn man gemeinsam mit seinen Rössern eine Arbeit verrichtet. Man riecht den Boden, spürt das Wetter und ist stets im engen Kontakt mit seinen riesenhaften Arbeitspartnern, die einen immer wieder mit ihrer Kraft, Geschicklichkeit und Intelligenz überraschen.

**7 — PFERDEVISION · Closing manifesto**
*(On the live page this paragraph is rendered into `Vision-scaled.jpg` — it is not text. Transcribed from the image, 2026-07-24. Setting it as real HTML text is a deliverable, not a nice-to-have.)*

Ein visionärer Blick aus unserer Vergangenheit in die Zukunft: Das Hofkollektiv SONNWERK soll sich als ideale Symbiose von Fortschritt und Tradition verstehen. Es ist bei weitem nicht alles Moderne schlecht und nicht alles Traditionelle automatisch gut. Deshalb gilt es wie immer, die goldene Mitte zu finden, und dabei seine Souveränität und Freude am Tun nicht zu verlieren. Die Pferdekraft kann und muss moderne Maschinen nicht überall ersetzen, jedoch dort wo es sinnvoll, nachhaltig und effektiv ist, sollen die Rösser den Vorzug bekommen.

**New copy (ours, brand voice — the live page has no CTA and dead-ends into the footer):**
CTA eyebrow: `Mitfahren` · Headline: „Sieh Dir das aus der Nähe an." · Buttons: `Kutschenfahrten anfragen` → `/hof/#kutschenfahrten`, `Zum Shop` → `/shop/`.

---

## Appendix B — reference screenshots
Live page reviewed in-browser at 1568px on 2026-07-24: hero band, BODEN|KULTUR pair, TEMPO|ENERGIE|KREISLAUF triptych, Waldkante strip + „Das Pferdvolle", HANDWERK, full-width photo, second Waldkante strip, „Pferdevision" + baked-in-JPEG manifesto. Findings are folded into §D0a. Re-shoot the live page into `refs/pferd-live/` in Phase 0 if a pixel reference is wanted alongside our build.
