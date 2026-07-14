# MEDIA GENERATION GUIDE — lab/002 SONNWERK
**Backend: Google Flow · video model: Gemini Omni Flash · image model: Nano Banana (2/Pro)**
Date: 2026-07-13 · companion to `2026-07-12-sonnwerk-lab002-design.md` + `../generation-sheet.md`
Purpose: everything needed to run Gate 0 → Gate 1 → Gate 2 in one sitting, Omni-Flash-specific.

---

## 1. WHY OMNI FLASH (vs Veo 3.1) FOR THIS PROJECT

| Capability | Omni Flash | Veo 3.1 | SONNWERK use |
|---|---|---|---|
| Durations | 4/6/8/**10s** | 4–8s (10s Fast/Quality, text-to-video only) | 8s standard; 10s spare room on journey clips |
| Ingredients/references to video | yes, any duration | 8s only | identity anchors on every clip |
| Frames to Video (first) | yes | yes | all journey clips |
| Frames to Video (first+last) | docs say "coming soon" — **works live** (verified in Flow, July 2026 — re-verify before batch day) | yes | chaining seams |
| Edit generated video with follow-up prompt | **yes (exclusive)** | no | fix a take instead of re-rolling — new cheapest iteration path |
| Temporal prompting (`[0-3s] …`) | yes, natural language | no | choreograph the drop in EXTRAKTION, the pull-back reveal in FLASCHE |
| Native audio | yes — still prompt "no dialogue, no music" and strip AAC anyway | yes | unchanged rule |

Fallback: if Omni first+last is broken on batch day, journey clips fall back to Veo 3.1 Fast Frames-to-Video (8s) — prompts below work on both.

## 2. INGREDIENT TAGGING (the Omni-specific part)

Omni binds uploaded media to roles with tags in the prompt text:

- `<FIRST_FRAME>` — the uploaded image IS the video's first frame (our Frames-to-Video path)
- `<IMAGE_REF_0>`, `<IMAGE_REF_1>`, … — references (identity/style/scene), numbered from 0; ~6 refs demonstrated as workable, we never need more than 3–4
- Explicit form for complex cases: `[# Sources <FIRST_FRAME>@Image1]` / `[# References <IMAGE_REF_0>@Image2]`

**SONNWERK role convention (use these slots consistently on every generation):**
- `IMAGE_REF_0` = grade anchor (approved master still 0A) — ALWAYS with the bleed clause: "use <IMAGE_REF_0> ONLY for color grade, lighting character, and film grain — different scene: no hemp field rows unless the first frame contains them"
- `IMAGE_REF_1` = subject identity (Bitzan bottle / product / horse / real farm photo)
- `IMAGE_REF_2` = optional scene ref (real farm environment photo)
- `<FIRST_FRAME>` = the approved chapter start frame (Gate 1 output) — the start frame carries the look; do NOT re-describe the full aesthetic (style-hold clause instead)

Duration & aspect are set in the prompt-box **settings UI**, not prompt text. Always 1080p · 16:9 · 8s (9:16 not needed; mobile uses half-res frames of the same clips).

## 3. NON-NEGOTIABLE RULES (carried from lab/001 — do not relearn)

1. Camera instruction isolated, FIRST, professional terminology, own sentence — then explicit exclusions ("the subject does not rotate, spin, or move; only the camera moves").
2. Style-hold, not style-stack: "Maintain the exact color grade, depth of field, and film grain of the provided frame — do not brighten or clean up."
3. Always append: "No dialogue, no music. No warping, no morphing, no extra limbs. Single continuous shot, no scene cuts." (the last sentence is Omni-specific — it multi-cuts without it)
4. End frames derived FROM start frames via image edit (camera position only, never content) — same-scene multi-frame trick.
5. No readable text/logos/faces in focus (HTML overlays real text).
6. Geometry-first still selection: composition must physically support the single permitted camera move.
7. Don't prompt objects/people that aren't in the still.
8. Judge against brand tokens, not prompt wording. Reject: cold/neon drift · clinical white · leaf clichés · dispensary look · identity break · >1 camera move · handheld feel.

**Omni-specific additions:**
9. Temporal syntax for choreography: `[0-2s] …, [2-6s] …, [6-8s] …` — use it ONLY where an event must land at a scroll seam; otherwise leave timing free.
10. Iterate with EDIT before re-rolling: "Keep everything else the same. Slow the camera move by half." Editing an 80%-right take is cheaper than a new roll.
11. Audio prompt: "No dialogue, no music, no sound effects." — then strip anyway: `ffmpeg -i in.mp4 -an -c:v copy out.mp4`.

## 4. PIPELINE (Gate 0 → ingest)

**Gate 0 — real anchors (client dependency, collect first):** Bitzan product stills (originals), farm/field/horse photos, one bottle hero still, logo SVG. → drop in `assets-in/gate0/`.

**Gate 1 — stills in Nano Banana (cheap, iterate; Russ approval before ANY video):**
1. Master grade still 0A „golden hour hemp field" (2–3 takes, pick by composition fit not model)
2. Chapter start frames 0B–0E (composite real anchors into scenes — scene-first, subject-composited-second)
3. End frames via image EDIT of each start frame: "camera moved forward / pushed in — same scene, nothing added or removed"
4. Chain check: 0B.end ≈ 0C.start etc. Approve all 9 stills before Gate 2.

**Gate 2 — clips in Omni Flash (prompts in §5):** journey 1 → seam check → journey 2–4 → ambient loops → hover loops. 2–3 takes on journey clip 1 only; elsewhere first acceptable take, fix with edit-prompts.

**Ingest (per generation-sheet):** strip AAC → trim warped first/last frames → journey: `ffmpeg -vf "fps=24,scale=1920:-1" -c:v libwebp -q:v 72 frame_%04d.webp` with CONTINUOUS numbering across the 4 clips → seam QA frame-by-frame on all 3 joints → posters → half-res mobile set (clips 1+4 only + crossfade) → update counts in `site/src/content/site.ts`.

## 5. PASTE-READY PROMPTS

*(Settings each time: 1080p · 16:9 · 8s. Attach images in the listed slot order.)*

### J1 — FELD (attach: FIRST_FRAME=0B.start, refs not needed — the frame carries everything; if first+last live: LAST_FRAME=0B.end)
> Camera: slow forward aerial dolly drift.
> <FIRST_FRAME> The camera drifts forward over the hemp field toward the horizon. The plants sway minimally in a light breeze; the sun stays low on the horizon. Only the camera moves. Single continuous shot, no scene cuts.
> Maintain the exact color grade, depth of field, and film grain of the provided frame — do not brighten or clean up.
> No dialogue, no music, no sound effects. No warping, no morphing, no extra limbs.

### J2 — ERNTE (attach: FIRST_FRAME=0C.start, IMAGE_REF_0=0A grade anchor)
> Camera: slow descend and push-in, macro.
> <FIRST_FRAME> The hands complete one single cutting motion on the hemp stem. Nothing else in the frame moves. Only the camera pushes in slowly. Single continuous shot, no scene cuts.
> Use <IMAGE_REF_0> ONLY for color grade, lighting character, and film grain — different scene.
> Maintain the exact color grade, depth of field, and film grain of the provided frame — do not brighten or clean up.
> No dialogue, no music, no sound effects. No warping, no morphing, no extra limbs.

### J3 — EXTRAKTION (attach: FIRST_FRAME=0D.start; temporal choreography for the seam)
> Camera: locked-off macro with a very slow push-in.
> <FIRST_FRAME> [0-5s] A single drop of golden oil slowly forms at the glass. [5-7s] The drop falls. [7-8s] Stillness. Only the drop moves; the camera pushes in almost imperceptibly. Single continuous shot, no scene cuts.
> Maintain the exact color grade, depth of field, and film grain of the provided frame — do not brighten or clean up.
> No dialogue, no music, no sound effects. No warping, no morphing.

### J4 — FLASCHE (attach: FIRST_FRAME=0E.start=droplet macro, IMAGE_REF_1=Bitzan bottle still; if first+last live: LAST_FRAME=0E.end=bottle reveal)
> Camera: slow dolly-out.
> <FIRST_FRAME> [0-2s] The droplet lands. [2-8s] The camera pulls back smoothly to reveal the finished bottle standing in golden backlight, matching <IMAGE_REF_1> exactly. The bottle does not rotate, tilt, or move; only the camera moves. Single continuous shot, no scene cuts.
> Maintain the exact color grade, depth of field, and film grain of the provided frame — do not brighten or clean up.
> No dialogue, no music, no sound effects. No warping, no morphing. No readable text on the label in focus.

### Ambient loops (A1–A4; attach FIRST_FRAME = composited still, IMAGE_REF_0 = 0A grade anchor; loop rule: end state ≈ start state)
> Camera: static, locked off.
> <FIRST_FRAME> {ONE of: The horse shifts its weight gently, mane moving in the breeze / Steam rises steadily from the tea / Light drifts slowly across the balm surface / The dog breathes slowly, resting}. The motion is subtle and continuous, ending in the same state it began so the clip loops seamlessly. Only that element moves. Single continuous shot, no scene cuts.
> Use <IMAGE_REF_0> ONLY for color grade, lighting character, and film grain — different scene.
> No dialogue, no music, no sound effects. No warping, no morphing, no extra limbs.

### Product hover loops (H1–H6; attach FIRST_FRAME = Bitzan still on cream)
> Camera: static, locked off.
> <FIRST_FRAME> Warm light drifts slowly across the product from left to right and back, returning to the starting position so the clip loops seamlessly. The product does not move, rotate, or change. Background stays clean cream. Single continuous shot, no scene cuts.
> No dialogue, no music, no sound effects. No warping, no morphing. No readable label text in focus.

### Edit-prompt patterns (Omni's cheapest iteration path — try before re-rolling)
> "Keep everything else the same. Slow the camera movement to half speed."
> "Keep everything else the same. Warm the color grade slightly toward amber; remove the blue cast."
> "Keep everything else the same. Remove the second camera move after the 5 second mark."
> "Keep everything else the same. The bottle must not rotate — hold it perfectly still."

## 6. BUDGET & CHECKLIST

~14 base generations (4 journey + 4 ambient + 6 hover) + Gate 1 stills (cheap) + edit-passes as needed. 2–3 takes on J1 only.

- [ ] Gate 0 assets in `assets-in/gate0/`
- [ ] Re-verify Omni first+last frames works in Flow UI (else Veo 3.1 Fast fallback for journey)
- [ ] Gate 1: 0A + 8 chapter frames approved by Russ
- [ ] Gate 2: J1 approved → J2–J4 → A1–A4 → H1–H6
- [ ] Every file: strip AAC, name per generation-sheet delivery list
- [ ] Seam QA all 3 joints frame-by-frame before extraction
- [ ] Ingest → update `site/src/content/site.ts` frame counts → delete placeholder media

## Sources
- Flow supported models & features: https://support.google.com/flow/answer/16352836
- Omni Flash API / tagging & prompting: https://ai.google.dev/gemini-api/docs/omni
- Omni announcement: https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-omni/
- Project context §3 (Veo/Flow rules, lab/001 learnings) — single source of truth where docs conflict
