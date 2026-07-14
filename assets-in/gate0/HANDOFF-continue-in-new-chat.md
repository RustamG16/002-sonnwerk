# SONNWERK lab/002 — handoff for new chat

Paste this whole file as your first message in the new chat (or attach it) so Claude has full context. Also re-attach `media-generation-guide.md` if you still have it — it's the master rulebook and wasn't editable in this session.

## Project
Austrian BIO CBD brand SONNWERK (sonn-werk.at). Building a branded video/image pipeline: Gate 0 (real photo anchors) → Gate 1 (approved stills, Nano Banana) → Gate 2 (8s video clips, Omni Flash) → Ingest/QA (ffmpeg, site update). Backend: Google Flow (labs.google/fx/tools/flow).

Two connected folders:
- **gate0** — real scraped photos from the site (`horse/`, `farm/`, `bottle/`, `product/`, `logo/`). Files here can't be deleted/renamed once written.
- **NANO** — all Google Flow generation output (stills + videos). Freely renameable; this is where all Gate 1/2 work lives.

## Non-negotiable rules (from media-generation-guide.md)
1. Camera instruction isolated, first, own sentence — then exclusions ("only the camera moves").
2. Style-hold not style-stack: "Maintain the exact color grade, depth of field, and film grain of the provided frame — do not brighten or clean up."
3. Always append: "No dialogue, no music. No warping, no morphing, no extra limbs. Single continuous shot, no scene cuts."
4. End frames = start frame + camera-only edit (never content change) — **except** where the shot's whole point is a content change over time (see J2/J3 below).
5. No readable text/logos/faces in focus — **overridden by user for J4/Bottle Reveal specifically** (deliberate call, worth flagging to Russ at approval).
6. Geometry-first still selection — composition must support the one permitted camera move.
7. Don't prompt objects/people not in the reference still.
8. Judge against brand tokens, not prompt wording. Reject: cold/neon drift, clinical white, dispensary look, identity break, >1 camera move, handheld feel.
9. Omni: use temporal syntax `[0-3s]…` only when an event must land at a specific moment.
10. Iterate with EDIT ("keep everything else the same, change X") before re-rolling from scratch.
11. Strip AAC from every final clip: `ffmpeg -i in.mp4 -an -c:v copy out.mp4`.

Omni Flash ingredients: up to 4 images. SONNWERK tag convention: `<FIRST_FRAME>`, `<LAST_FRAME>`, `<IMAGE_REF_0>` (grade anchor, bleed clause), `<IMAGE_REF_1>` (subject identity), `<IMAGE_REF_2>` (optional scene). Always use explicit tagging: `[# Sources <FIRST_FRAME>@Image1, <LAST_FRAME>@Image2]` and make sure `<LAST_FRAME>` is actually referenced inline in the prompt body, not just declared.

## Journey clips
J1=FELD (field), J2=ERNTE (harvest/cut), J3=EXTRAKTION (oil drop), J4=FLASCHE (bottle reveal).

## Status — approved and in NANO folder
**Gate 1 stills (all approved, plain-English names):**
- `01_Field-Master.jpeg` — wide hemp field, sun on horizon (grade anchor + J1 start)
- `02_Field-Opener_END.jpeg` — same field, camera pushed forward
- `03_Harvest-Hands_START.jpeg` — both hands, shears mid-cut on intact stem
- `04_Harvest-Hands_END.jpeg` — same, camera pushed in closer (⚠ still shows an INTACT stem — see blocker below, this file needs replacing)
- `05_Oil-Drop_START.jpeg` — glass dropper tip + drop, no bottle
- `06_Oil-Drop_END.jpeg` — same, pushed in closer
- `07_Bottle-Reveal_START.jpeg` — extreme macro droplet, bottle barely visible/blurred
- `08_Bottle-Reveal_END_sharp-bottle.jpeg` — bottle sharp/legible (rule-5 override, dark warm studio bg)

**Gate 2 video clips (approved):**
- `J1_Field-Opener_APPROVED.mp4` — clean forward dolly, rows stay straight, matches end still. Done.
- `J4_Bottle-Reveal_APPROVED.mp4` — droplet lands, pulls back to reveal bottle, label reads "HOFKOLLEKTIV / SONN'WERK / CBDÖL 29%" correctly. **One unresolved item: user should do a final full-zoom check on "AUS BIONUTZHANT" vs correct "AUS BIONUTZHANF" — tiny possible typo, not yet confirmed fixed or acceptable.**

## Current blocker — J2 ERNTE (the harvest cut), NOT YET SOLVED
Goal: hands complete one cutting motion on a hemp stem, camera pushes in, single continuous 8s shot.

**Problem:** every video generation attempt fails to show a real completed cut. Root cause diagnosed: `04_Harvest-Hands_END.jpeg` only changes camera distance, not the stem's state (still intact) — so when used as `<LAST_FRAME>`, Omni has no reason to let the cut actually finish, and reverts to "safe" (shears touch the stem, nothing separates).

**Attempted fixes, all unsuccessful so far:**
1. Used `04_Harvest-Hands_END.jpeg` (intact stem, just zoomed) as literal LAST_FRAME → cut motion looked fake, plant stayed whole, no aftermath, across all 4 takes.
2. Used a "stem already cut" still as a loose reference instead of strict LAST_FRAME → better but still not a proper completed cut.
3. Asked user to generate a proper post-cut still via Nano Banana edit of `03_Harvest-Hands_START.jpeg` with this prompt:
   > "Edit this image: the cutting motion is now complete. The shears have fully closed through the stem — the flower head has separated from the plant and is lifted about 3-5cm away, held gently between the fingers. The stem's fresh-cut end is visible: a clean, pale fibrous cross-section, no jagged tearing. Camera position, lighting, hands, and background stay exactly the same — only the stem/flower state and the shears' blade position change to show the completed cut."
   → Grid of 12 results, none clearly showed a real separation — mostly still "blades gripping an intact stem," same ambiguity as before.
4. Tried an even more explicit version demanding the shears move out of contact with the stem, naming a specific 4-6cm gap → not yet tested / results not confirmed good.
5. User's two most recent uploads (not yet saved to NANO — **need to be manually saved by user** to `assets-in/NANO/` since they were pasted directly in chat, not uploaded as files) are described as "the best versions so far":
   - Candidate A: wide two-hand shot, right hand's shears cutting one stem while left hand separately holds a different, already-separated bud lower in frame — busy composition, multiple stems/buds in frame, ambiguous which one is "the" cut subject.
   - Candidate B: tighter crop of a similar moment — left hand holds a short pale cut stem-tip, right hand's shears grip an adjacent stem with buds still on it. Better but still ambiguous about which stem was actually severed.
   - Neither is confirmed as clean enough to use as final `04_Harvest-Hands_END` replacement.

**Recommended next steps (pick up here):**
1. Ask the user to save their "two best" images into `assets-in/NANO/` with clear names (e.g. `04b_Harvest-Hands_END_candidate-A.jpeg`, `...candidate-B.jpeg`) so they're in the shared folder and can be inspected directly.
2. Consider simplifying the composition: a single stem/single bud in frame (not two hands doing two different things) to reduce hallucination surface — the multi-stem busyness may itself be causing Omni to lose track of which cut matters.
3. Consider dropping the shears from the END still entirely — show only the cut result (severed bud held in fingers, bare stub with visible pale cut cross-section on the plant, shears out of frame or resting aside) so there's zero ambiguity about "still cutting" vs "done."
4. Once a clean END still is confirmed, rebuild the J2 video prompt with explicit temporal staging, e.g.:
   `[0-3s] the shears close around the stem, [3-4s] the cut completes and the stem visibly severs, [4-8s] the hand lifts the separated flower away from the plant, revealing the fresh-cut stem end` — plus an explicit line like "the stem does not remain attached after the cut."
5. If Omni continues to fail on this specific content-change action after 2-3 more focused attempts, consider the documented fallback: Veo 3.1 Fast Frames-to-Video (8s), which may handle the discrete cut-then-separate action differently than Omni.

## Still pending after J2 is solved
- J3 — EXTRAKTION: attach `05_Oil-Drop_START.jpeg` as FIRST_FRAME, temporal choreography `[0-5s] drop forms, [5-7s] drop falls, [7-8s] stillness`. Stills already approved, not yet generated as video.
- Ambient loops A1-A4 (horse, tea, balm, dog — static locked-off camera, subtle looping motion).
- Product hover loops H1-H6 (static camera, light drifting across product on cream background).
- Ingest & QA gate (not started): strip AAC from all clips, extract frames via ffmpeg (`fps=24,scale=1920:-1`, libwebp q:v 72, continuous numbering across all 4 journey clips), seam QA frame-by-frame on all 3 joints, generate posters, half-res mobile set (clips 1+4 + crossfade), update `site/src/content/site.ts` frame counts.
- Confirm the "AUS BIONUTZHANT/F" typo check on the approved J4 clip.
- When the pipeline goes up for Russ's approval, flag the J4 "readable text in focus" rule-5 override explicitly as a deliberate decision, not an oversight.

## Working conventions established this session
- Always give plain-English file names (Field Master, Harvest Hands, Oil Drop, Bottle Reveal), not internal codes (0A-0E).
- Rename approved video files directly in the NANO folder to `J#_Name_APPROVED.mp4` as soon as they're confirmed good.
- Use ffmpeg to pull first/mid/last frames from any new .mp4 for review, since images can be read directly but video can't be played.
- Always state explicit `[# Sources <FIRST_FRAME>@Image1, <LAST_FRAME>@Image2]` tagging and reference `<LAST_FRAME>` inline in the prompt body — this was missed once and caught by the user.
