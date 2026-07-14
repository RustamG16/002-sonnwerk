# LOG — lab/002-sonnwerk
*One line per event: retakes, manual hacks, time sinks, deviations.*

- 2026-07-12 · design spec written + approved section-by-section (files/2026-07-12-sonnwerk-lab002-design.md)
- 2026-07-13 · Stitch design generated + reviewed; 7 fixes pending (files/2026-07-13-sonnwerk-lab002-handoff.md)
- 2026-07-13 · project scaffolded per The Law (intake/brandspec/sitespec filled from spec — first project where intake was back-filled from an approved spec rather than driving it)
- 2026-07-13 · site build started BEFORE Gate 0 assets — placeholder frame sequences generated (engine placeholder pattern, custom sonnwerk generator: 4 chained chapters, green-black/gold)
- 2026-07-13 · first Astro build in the lab (lab/001 site never landed in repo) — lab/002 becomes the Astro convention source, not the copy target
- 2026-07-13 · cart implemented as vanilla localStorage module instead of React island (spec said React islands) — placeholder until Woo Store API wiring; revisit at Woo integration
- 2026-07-13 · Stitch export requested from Russ (.zip format) to mine copy/layout; build not blocked on it
- 2026-07-13 · bug: `[hidden]` beaten by `display:flex` on cart drawer → drawer open on load; fixed with explicit `[hidden]{display:none}` (add to LEARNINGS candidate list)
- 2026-07-13 · verified in browser: journey scrub (meter fill 65% at 65% progress, chapter fades correct), cart add/qty/persist across pages (€209,60 check ✓), shop/product/hof render, no console errors, 25 pages build in 2.3s, placeholder media payload 2.9 MB
- 2026-07-13 · browser-pane screenshots went flaky mid-session (tool-side); verification completed via DOM/JS inspection
- 2026-07-13 · media generation guide written (files/media-generation-guide.md) — Omni Flash pivot for video (was Veo 3.1 default): ingredient tags, edit-iteration path, temporal prompting; generation-sheet prompts superseded by the guide's paste-ready versions
- 2026-07-14 · Gate 0 + Gate 1 + journey Gate 2 assets delivered (assets-in/): 4 approved Veo clips (J1/J4 1080p+AAC, J2/J3 720p), NANO stills, Bitzan product/bottle photos, farm/horse photos, transparent logos
- 2026-07-14 · ingest: 12fps extraction (payload-first; spec said 24 — 4×8s at 24fps blew the 15MB budget), continuous numbering 384 frames, 8-frame crossfade at all 3 seams (clips are grade-matched CUTS, not frame-matched — chapter copy at seams masks it), mobile 192 frames (clips 1+4 + 10-frame crossfade)
- 2026-07-14 · payload: desktop 16MB @1280w/q48 (1MB over target; eager half = 8MB in-target), mobile 6.8MB
- 2026-07-14 · real catalog mapped from Bitzan shoot: Öl 5/11/22%, Gel Wärmend, Balsam Wärmend, Creme-Set, Deocreme Rosenholz, Dusch-Shampoo, Hanftee (Bud), Hunde-Öl. Prices still placeholder → Woo fetch
- 2026-07-14 · no dog photos in Gate 0 → Begleiter band uses grazing-horse photo (on-brand, CTA still → Tierprodukte); no ambient/hover loops generated yet → real stills as posters (§4a poster-first pattern already handles it)
- 2026-07-14 · bug found via 0-width embedded viewport: scrubber constructed before layout → canvas.width=0 + mobile misdetection; fixed (init deferred until innerWidth>0, canvas resyncs in rAF loop when hosts resize without firing 'resize')
- 2026-07-14 · showcase pass: real logos (header mark, footer lang version, favicon), OG image from chapter-1 poster, all pages verified 200 + zero broken images, journey scrub verified 0→99% with meter/labels/chapter fades
- 2026-07-14 · Russ review fixes: hero copy now fully visible at load (fade math treated chapter 0 like a mid-journey chapter — first/last chapters now clamp toward their outer edge); text scrim added over bright sky; meter HUD retires when journey scrolls out (was fixed forever)
- 2026-07-14 · catalog corrected from photo labels: REAL oil strengths are 5/7/19% (spec's "11%" was a Stitch-prompt example, not the shelf) — slogan generalized to „Was draufsteht, ist drin"; added real Kühlend variants (Gel + Balsam); Tee card = tea-jar-with-farm-cat photo (was raw bud = leaf-cliché drift); Tierprodukte card = Hunde-Öl bottle (was horse); Begleiter band horse re-cropped top-aligned (head was cut)
- 2026-07-14 · quality bump: journey re-extracted q62 (J1/J4 at 1600w from 1080p sources), final q60 → 23MB desktop (~11.5MB eager) — payload target consciously traded for showcase quality; products re-cut at 1100px q85. Biggest remaining lever: re-download J2/J3 from Flow in 1080p (currently 720p)
- 2026-07-14 · Tee card take 3: bud (leaf-cliché) → jar+cat (Russ: wrong) → hands-with-dried-herb crop (8Q3A5987). Learning: product-category cards must read as PRODUCT, not farm mood — mood photos live elsewhere
- 2026-07-14 · /galerie added: infinite drag canvas (Codrops InfiniteCanvas pattern, vanilla ~80-line port — pointer drag + wheel, lerp inertia, modulo wrap both axes, hint fades on first drag), 16 farm/production images incl. Gate-1 stills, 940KB; JS-off/reduced-motion → static grid; footer hidden on canvas page; homepage teaser section (cream, 3 thumbs incl. the Hofkatze + CTA) between Begleiter band and quote — candidate ENGINE component for the catalog (archetype-agnostic gallery layer)
