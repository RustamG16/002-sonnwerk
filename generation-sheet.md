# Generation Sheet — SONNWERK (lab/002)
Backend: Google Flow · All video: 1080p, 16:9, no audio (strip AAC with `ffmpeg -an` anyway), 8s, duration set in prompt-box settings not prompt text. Reference assets attached to EVERY generation.
Judge against brand tokens (green-black #0D1408 · cream #F2EBDC · sun-gold #E8A33D · golden-hour amber + haze + grain), not literal prompt wording.
Reject: cold/neon drift · clinical white · leaf clichés · dispensary look · identity break still↔clip · >1 camera move per clip · readable text/logos/faces in focus.

## GATE 0 — real anchors (collect BEFORE Gate 1; client dependency)
- [ ] Apollonia Bitzan product stills (exist — request originals)
- [ ] Client farm / hemp field / horse photos
- [ ] One bottle hero still (best Bitzan bottle shot)
- [ ] Logo files (SVG preferred)

## GATE 1 — identity stills (iterate cheap; NOTHING moves before Russ approval)

### Asset 0A — master grade still „golden hour hemp field"
> Aerial photograph over an Austrian hemp field at dawn, low sun breaking the horizon, golden haze hanging over visible rows of hemp plants, deep green-black shadows, warm amber golden-hour grade, soft atmospheric haze, subtle film grain, cinematic documentary photography. No people, no text, no logos.
Takes: 2–3. Approval: [ ] Russ [ ] client

### Assets 0B–0E — 4 chapter start frames + end frames
Derive each END frame FROM its start frame via image edit — camera position ONLY changes (crop/push-in/"camera moved forward"), never content (same-scene multi-frame trick, lab/001).
Reference bleed rule on every generation: "use reference ONLY for color grade, lighting character, and grain — different scene."
Pick stills geometry-first: composition must physically support the single permitted camera move.

- 0B FELD start/end — master still (0A) family; end frame = pushed toward field rows
- 0C ERNTE start/end — macro hands cutting a hemp plant among rows (composite from real farm still if usable); end = pushed toward cut stem
- 0D EXTRAKTION start/end — interior, golden oil running through glass, slow drip macro; end = tightened on the forming droplet
- 0E FLASCHE start/end — start = droplet macro; end = finished SONNWERK bottle in golden backlight (REAL Bitzan bottle still as anchor)

Chain rule: 0B.end ≈ 0C.start · 0C.end ≈ 0D.start · 0D.end ≈ 0E.start (final-frame → start-frame).

## GATE 2 — clips (only after Gate 1; every clip references its approved still)

Motion prompts: camera instruction isolated and FIRST, professional terminology, explicit exclusions, style-hold clause (one sentence, not a style stack):
"Maintain the exact color grade, depth of field, and film grain of the provided frame — do not brighten or clean up."
Always append: "No dialogue, no music. No warping, no morphing, no extra limbs."
Don't prompt objects/people not present in the still.

### Journey clips (Frames-to-Video, chained; 2–3 takes on clip 1 only, first acceptable take elsewhere)
1. **FELD** — Camera: slow forward aerial dolly drift. > start 0B.start, end 0B.end. Sun stays on horizon; plants sway minimally; only the camera moves.
2. **ERNTE** — Camera: slow descend and push-in. > start 0C.start, end 0C.end. Hands complete one cutting motion; nothing else moves.
3. **EXTRAKTION** — Camera: locked-off macro with slow push-in. > start 0D.start, end 0D.end. One drop forms and falls; only the drop moves.
4. **FLASCHE** — Camera: slow dolly-out. > start 0E.start, end 0E.end. Droplet lands, camera pulls back to reveal the bottle; the bottle does not rotate or move.

### Ambient loops (~4; native <video>, loop-friendly: end state ≈ start state)
5. HORSES — Camera: static wide shot. Horse-drawn field work at golden hour, slow breathing motion, dust in backlight.
6. TEA — Camera: static macro. Steam rising from tea, warm side light.
7. BALM — Camera: static macro. Balm texture, light drifting slowly across the surface.
8. DOGS — Camera: static medium shot. Calm dog resting in golden light, slow breathing.

### Product hover loops (6; from Bitzan stills on cream; subtle turntable/light drift, loop-friendly)
9–14. ÖL · KOSMETIK · GEL · BALSAM · TEE · TIERPRODUKTE — Camera: static. Light drifts subtly across the product; product does not move (or ≤10° turntable, returning to start).

Budget: ~14 generations total.

## Delivery
Drop files in `assets-in/` named: `journey-1-feld.mp4 … journey-4-flasche.mp4`, `loop-horses.mp4`, `loop-tea.mp4`, `loop-balm.mp4`, `loop-dogs.mp4`, `hover-oel.mp4 … hover-tierprodukte.mp4`
→ strip audio → journey clips: webp extraction 24fps (engine/ffmpeg/extract.sh) into `site/public/media/journey/` (continuous frame numbering across the 4 clips, trim warped first/last frames, seam-QA all 3 joints frame-by-frame) → posters → ~90% compression → half-res mobile set → update `site/src/content/site.ts` frame counts.
