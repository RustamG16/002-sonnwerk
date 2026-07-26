# SONNWERK — Pass 3: alternation, design audit, motion system

*2026-07-27 · scope: `/arbeit-mit-dem-pferd/` · verification is manual (Russ), no Playwright/screenshot gate this pass*

## 0 · How this relates to Pass 2

**Run `files/2026-07-26-pass2-proximity-crop-and-blend-plan.md` first.** It caps the content column, rebuilds `.p-body` as a grid, and swaps the Energie photo. This document assumes all of that has landed.

Two places the passes interact — do not do the work twice:

- Pass 2 rewrites the chapter grids. Phase 1 here changes **which side** the columns sit on. Fold them into one edit if you're doing both in a session.
- Pass 2 swaps Energie to `13-8Q3A9263.jpg` and re-derives its scrim. Phase 1 here moves Energie's text to the **right**, which changes what the scrim has to darken. Do the swap first, then tune the scrim once, for the final text position.

Zugleine is **already gone** from `src/scripts/pferd.js` (only a stale header comment remains — fix the comment). Do not build the WebGL „Furche" from the Pass-1 plan; Phase 4 below replaces it.

---

## 1 · The thesis: the page ploughs

The chapters alternate left / right / left / right. That isn't decoration — it's the page's argument rendered as layout. A field is ploughed in alternating passes; the ox turns at the headland and comes back the other way. Ancient writing that alternates direction line by line is called **boustrophedon** — literally "as the ox turns." A page about draught animals opening ground is the one page on the internet entitled to that structure.

Everything in this plan follows from it: the layout alternates, the motion enters from the side each chapter sits on, and the two full-width sections are the moments the plough rests.

### Final rhythm

```
        ┌─────────────────────────────────────────────┐
 HERO   │  full bleed · headline bottom-left           │
        └─────────────────────────────────────────────┘
 BODEN  │ ▓▓▓▓ image ▓▓▓▓ │  text ──────────►  R       │  dark
 KULTUR │  ◄────── text   │ ▓ print ▓                L │  cream
 TEMPO  │ ▓▓▓▓▓▓▓ image, full width ▓▓▓▓▓▓▓            │  cream
        │  quote ────── │ ────── paragraph      CAESURA│
 ENERGIE│ ▓▓▓ full-bleed photo ▓▓▓ │ text ──────►  R  ←│  CHANGED
 KREIS. │  ◄────── text   │ ▓ small ▓                L │  dark
        ├───────── W A L D K A N T E ─────────────────┤  CAESURA
 HANDW. │ ▓▓▓▓ image ▓▓▓▓ │  text ──────────►  R       │  dark
 VISION │  ◄────── manifesto over photo            L   │  cream scrim
 MITFAH.│  full-bleed photo │ text ──────────►  R      │  CHANGED
        └─────────────────────────────────────────────┘

text side:  R  L  ·  R  L  ·  R  L  R
```

No seam, no repeat. The two caesuras (Tempo, Waldkante) are the only places the alternation pauses, and both earn it — Tempo is literally the chapter about not hurrying.

---

## Phase 1 — Alternation

Two sections move. Everything else keeps its current side.

### 1a · Energie — text moves right

```css
.chapter--energie { justify-content: flex-end; }        /* was: default / left */
.chapter--energie .chapter-text {
  max-width: 46ch;                                       /* NEW — see audit A9 */
  margin-left: auto;
  padding-inline: var(--edge);
}
```

**The scrim must flip with it.** The current gradient darkens the bottom and adds a gold wash from the top-left (`135deg`) — both tuned for text on the left over a *dark* photo. With text on the right over the new high-key ploughing frame, it needs a horizontal component weighted right, and the gold accent moved off the text:

```css
.chapter--energie .chapter-scrim {
  background:
    linear-gradient(to left, rgba(13,20,8,0.94) 0%, rgba(13,20,8,0.78) 42%, rgba(13,20,8,0.15) 78%, transparent 100%),
    linear-gradient(to top,  rgba(13,20,8,0.55), transparent 60%),
    linear-gradient(225deg, rgba(232,163,61,0.12), transparent 55%);
}
```

Numbers are a starting point, not a result — tune against the actual photo.

> **Composition conflict to check by eye.** In `13-8Q3A9263.jpg` the man at the plough sits at roughly 80% across. At wide viewports the frame crops vertically only, so he stays there — directly under the new right-hand text block. Under a right-weighted scrim he reads as a silhouette behind the copy, which is atmospheric and probably fine. If it reads as clutter, the fallback frame is `assets-in/gate0/farm/8Q3A5975-scaled.jpg`. **This is a look-at-it decision, not a measurable one.**

### 1b · Mitfahren (CTA) — text moves right

```css
.p-cta-inner { margin-left: auto; max-width: 46ch; }
.p-cta-scrim {
  background: linear-gradient(to left, rgba(13,20,8,0.92), rgba(13,20,8,0.5) 65%, rgba(13,20,8,0.35));
}
```

The scrim currently runs `to right` (dark on the left). It must invert or the buttons land on the bright side of the photo.

### 1c · Unchanged, for the record

Boden (image L / text R), Kultur (text L / print R), Tempo (full-width caesura), Kreislauf (text L / small image R), Handwerk (image L / text R), Pferdevision (manifesto **left**).

**Manual check:** scroll the page at 1920 and 1440. The text block should visibly bounce left-right-left-right with only two pauses. If your eye ever travels the same direction twice in a row, something moved that shouldn't have.

---

## Phase 2 — Design audit

Grouped so you can check each group in one pass. Every item is a code-level finding, not a guess.

### 2a · Viewport units (affects every resolution, worst on mobile)

`vh` on mobile Safari/Chrome measures the viewport *without* the collapsing URL bar, so these sections jump height mid-scroll:

| Selector | Current | Change to |
|---|---|---|
| `.p-hero` | `height: 80vh` | `height: 80svh` (with `80vh` fallback line above) |
| `.chapter--energie` | `min-height: 78vh` | `78svh` |
| `.p-vision` | `min-height: 90vh` | `90svh` |
| `.p-cta` | `min-height: 60vh` | `60svh` |
| `hof .hero` | `height: 92vh` | `92svh` |

Write both lines — `height: 80vh; height: 80svh;` — so old browsers keep the fallback.

### 2b · The 800–1000px dead band

`.p-rail` hides at `max-width: 1000px`, but every chapter's stacking rule fires at `max-width: 800px`. Between 800 and 1000 the rail is gone yet Boden / Kultur / Handwerk still run desktop two-column grids in a suddenly full-width container. **Align the two breakpoints at 1000px**, or add an intermediate rule. This is the most likely place the page is currently broken and nobody has looked.

### 2c · Images and loading

- Hero `<img>`: add `fetchpriority="high"`, `loading="eager"`, `decoding="async"`. It is the LCP element and currently has none of these.
- Boden's image has `loading="lazy"` but sits immediately below an 80vh hero — it's in view on short viewports before the lazy threshold helps. Drop `lazy` on Boden only.
- **After the Energie swap:** update that `<img>`'s `width`/`height` to the new file's real intrinsic dimensions. Every image on the page currently declares `1600×1066`; if the new derivative isn't 3:2, CLS comes back.
- Hero `alt` says „Kopf an Kopf mit einem Pferd" but the source frame (`69-8Q3A9873.jpg`) shows the man beside the horse, not head to head. Correct the description.

### 2d · Reading order and semantics

- **Handwerk has an inverted DOM order.** Every other chapter runs eyebrow → h2 → blockquote → paragraph. Handwerk runs eyebrow → blockquote → h2 → paragraph, so the pull-quote precedes the heading it belongs to. Reorder to match, and keep the visual emphasis with CSS if the quote should still read first.
- `.p-rail a.active` carries no ARIA. Add `aria-current="true"` on the active link and remove it from the others in `pferd.js`.
- `html { scroll-padding-top: 96px }` assumes a 96px header at every width. Verify the mobile header height and make it a token (`--header-h`) used by both the header and `scroll-padding-top`.

### 2e · Measure and contrast

- `.chapter--energie .chapter-text` has **no `max-width`** — at 1920 the body copy runs the full column over a photograph. Cap at `46ch` (done in 1a).
- `.chapter-text blockquote { max-width: 22ch }` is too tight for Tempo once its text becomes a two-column row (Pass 2, Phase A). Let the column govern; drop the `22ch` cap there.
- After Phase 1, re-check contrast on Energie, Pferdevision and Mitfahren by eye at 1440 and 390 — all three now have text over photography on the side their scrim used to leave bright.
- `.chapter--kreislauf .chapter-media--small` goes `width: 100%` on mobile, which turns "deliberately small and unglamorous" into the largest image on the screen — inverting its meaning. Cap it around `60%` on mobile.

### 2f · Focus states

Confirm `:focus-visible` is defined for `.p-rail a`, `.btn`, `.more-link` and the header nav — a visible keyboard focus ring is the quality floor, and the rail is a navigation element. Tab through the page start to finish; if you lose the caret, that's the bug.

---

## Phase 3 — Motion system

### The problem

The whole site currently has **two** reveal behaviours:

1. `.reveal` — `opacity 0→1`, `y 28→0`, `power2.out`, 0.8s, `(i % 4) * 0.08` delay. Applied to every eyebrow, heading, quote and paragraph on every page.
2. `.reveal-mask` — a `clip-path` inset wipe, bottom → top, on the pferd chapter images.

Plus a small parallax on the galerie teaser. That's it. The complaint is correct: the page fades, and fades, and fades.

### The rule

One vocabulary, derived from the subject, applied consistently — not a catalogue of effects. **Nothing on this page pops, bounces or scales up.** A draught horse doesn't accelerate; it leans into the collar and the load starts moving. Every entrance is a *pull*: resistance, then release, then a settle.

```js
// registered once, in motion.js
gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase);
CustomEase.create('furche', '0.62,0.02,0.15,1');   // slow break, long release
gsap.defaults({ ease: 'furche', duration: 0.8 });
```

> All GSAP plugins — **including SplitText** — are free since the Webflow acquisition. Install from the public `gsap` package. Do **not** add an `.npmrc`, a GreenSock auth token, or the private registry; any doc telling you to is out of date. `gsap` is already installed (CLAUDE.md: never npm-install it again).

### M1 · Masked line-rise on headlines *(replaces fade on h1/h2/blockquote)*

Fraunces at 3.4rem deserves better than a 28px nudge. Split each heading into lines, wrap each line in a clipping mask, and let the lines rise out from behind their own edge.

```js
SplitText.create('.split-rise', {
  type: 'lines',
  mask: 'lines',
  autoSplit: true,
  onSplit(self) {
    return gsap.from(self.lines, {
      yPercent: 110, stagger: 0.08, duration: 0.9,
      scrollTrigger: { trigger: self.elements[0], start: 'top 85%', once: true },
    });
  },
});
```

- `autoSplit: true` re-splits when the webfont loads and when the element's width changes — essential here, because Fraunces is a variable font and you care about every resolution. Animations **must** be created inside `onSplit()` and **returned** from it, or they'll target stale elements after a re-split.
- Default `aria: "auto"` keeps screen readers reading the whole heading, not the fragments.
- Add `font-kerning: none; text-rendering: optimizeSpeed;` on split headings to avoid a kerning shift at split time.

> **Trap.** `global.css` has `html.js .reveal { opacity: 0 }`. If a heading keeps `.reveal` *and* gains `.split-rise`, it stays invisible forever — GSAP animates the lines while the parent is still at opacity 0. Move headings **off** `.reveal` onto `.split-rise`, and add the no-FOUC hide for the new hook under `html.js` only, per the CLAUDE.md rule.

### M2 · Directional entrance — the boustrophedon in motion

This is the idea that makes the page feel authored. Each chapter's text enters **from the side it lives on**: right-set chapters slide in from the right, left-set from the left. Scroll the page and it walks.

```js
gsap.utils.toArray('.chapter').forEach((ch) => {
  const dir = ch.dataset.side === 'right' ? 1 : -1;   // set data-side in the .astro
  gsap.from(ch.querySelectorAll('.eyebrow, .dim, .btn'), {
    x: 32 * dir, autoAlpha: 0, stagger: 0.07,
    scrollTrigger: { trigger: ch, start: 'top 80%', once: true },
  });
});
```

Headline rises (M1) while the body slides in (M2) — two motions in one block is what reads as choreography rather than a template. Travel drops to 16px under `isMobile`.

### M3 · Directional image wipes *(upgrade of the existing mask)*

The `clip-path` wipe already exists and is good. It just points the same way every time. Make it uncover **toward** its text — Boden's left image wipes left→right, Kultur's right print wipes right→left:

```js
gsap.fromTo(el,
  { clipPath: dir === 1 ? 'inset(0 0 0 100%)' : 'inset(0 100% 0 0)' },
  { clipPath: 'inset(0 0 0 0)', duration: 1, scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
```

Same cost as today. Reads as deliberate instead of default.

### M4 · Slow drift on full-bleed photography only

Energie, Pferdevision and Mitfahren are the only elements with room to move without shifting layout. Scrub `scale: 1.06 → 1` and `yPercent: -3 → 3` across each section's own scroll range, `scrub: 0.6`.

**Do not** put this on in-column images — that's what makes photos detach from their captions. Animate `scale`/`yPercent` on the `<img>` inside its `overflow: hidden` parent; never `top`, `height` or `background-position`. Disabled entirely under `isMobile`.

### M5 · Waldkante — the page's one orchestrated moment

The divider is the caesura, so give it the single beat the rest of the page doesn't get: the treeline strip opens horizontally from the centre out while the headline's lines rise, on one timeline, `once: true`.

```js
gsap.timeline({ scrollTrigger: { trigger: '.waldkante', start: 'top 80%', once: true } })
  .fromTo('.waldkante img', { clipPath: 'inset(0 50% 0 50%)' }, { clipPath: 'inset(0 0 0 0)', duration: 1.1 })
  .from(waldkanteLines, { yPercent: 110, stagger: 0.08 }, '-=0.5');
```

One orchestrated beat lands harder than six scattered effects. This is the only timeline on the page.

### M6 · Micro-interactions (small, and that's all)

- Rail links: a gold underline draws left→right on hover (`scaleX` from `transform-origin: left`, 0.25s).
- Active rail label: expand `letterSpacing` `0.26em → 0.34em` alongside the colour change — the label *tightens into focus* rather than just recolouring.
- `.more-link` arrow nudges `x: 4` on hover.

Nothing else. No magnetic cursor, no tilt, no scramble.

### Governance — not optional

- **`gsap.matchMedia()` wraps all of it**, with three conditions: `isDesktop (min-width: 1001px)`, `isMobile (max-width: 1000px)`, `reduceMotion (prefers-reduced-motion: reduce)`. Under `reduceMotion`, everything resolves visible with `duration: 0` — matchMedia reverts its own animations and ScrollTriggers automatically when a query stops matching, which is why it replaces the current hand-rolled `reducedMotion` boolean.
- **`ScrollTrigger.batch()`** for the repeated reveals instead of one trigger per element. The pferd page currently creates ~40 individual ScrollTriggers; batching collapses that and gives you a real stagger on elements that enter together.
- **`ScrollTrigger.refresh()` after `document.fonts.ready`.** Fraunces is a variable webfont; when it swaps in, every line breaks differently and every trigger position moves. This call is missing today — a genuine bug, not a nicety.
- Create triggers **top-to-bottom**, or set `refreshPriority` so they refresh in page order.
- Keep `lenis.on('scroll', ScrollTrigger.update)` as-is, and keep `window.__lenis` exposed.
- **Never `ScrollTrigger.getAll().kill()`** in a resize handler — that's how the mask reveals were killed once before (`LOG.md`, 2026-07-25). `matchMedia` cleanup makes it unnecessary anyway.
- Prefer transforms (`x`, `yPercent`, `scale`, `autoAlpha`) over `width`/`height`/`top`/`left` throughout. Use `autoAlpha`, not `opacity`, so hidden elements don't swallow clicks.

### Explicitly not doing

No pinned or scroll-jacked sections below the hero (banned by CLAUDE.md). No character-scramble or typewriter text — wrong register for a farm. No Flip, no Draggable on this page (`/galerie` owns drag; repeating it dilutes it). No `back`/`elastic`/`bounce` eases anywhere. No counters — there are no numbers.

---

## Phase 4 — Signature *(optional; skip freely)*

The page has no signature element: the Zugleine was deleted and its WebGL replacement was never built. This is the cheap way back.

**The tag rail becomes the furrow.** A 1px gold hairline runs the sticky rail's full height. As you scroll through the chapters, its filled portion lengthens — a furrow growing behind the plough. The rail stops being a menu sitting beside the content and becomes the instrument that measures your progress through it.

```js
const setFill = gsap.quickSetter('.p-rail-furrow', 'scaleY');
ScrollTrigger.create({
  trigger: '.p-chapters', start: 'top 60%', end: 'bottom bottom',
  onUpdate: (self) => setFill(self.progress),
});
```

`quickSetter` writes directly each frame with no tween overhead — the right tool for a per-frame value. `transform-origin: top`, `scaleY` on a 1px absolutely-positioned element inside the rail. Hidden below 1000px with the rail. Under reduced motion it renders fully drawn and static.

Cost: about fifteen lines and no new dependency. That is the whole reason to prefer it over the three.js band, which needs ~140KB, a paused-off-screen canvas, and several passes to not look cheap.

**Do not build the WebGL „Furche".** If it's ever wanted, it's a separate decision on a page that's already correct.

---

## Order of work

**Pass 2 (container + Energie photo + hof blending) → Phase 1 → Phase 2 → Phase 3 → Phase 4.**

Phase 1 is small and changes what Phase 2's contrast checks are looking at, so it goes first. Phase 2 is independent bug-fixing. Phase 3 is the largest single edit and should land on a page whose layout is already settled. Phase 4 is optional and last.

---

## Manual check list

No Playwright this pass — here's what to actually look at, per phase.

**After Phase 1** — at 1920 and 1440, scroll top to bottom. Text should alternate right, left, right, left with pauses only at Tempo and Waldkante. Read the Energie and Mitfahren copy against the photo behind it; if any word is hard to read, the scrim isn't done.

**After Phase 2** — resize slowly from 1920 down to 390 and watch the 800–1000px band specifically. On a phone, scroll the hero up and down: it should not change height. Tab through the whole page; you should never lose the focus ring.

**After Phase 3** — scroll once at normal speed and ask whether the page feels like it's walking. Then turn on reduced motion in the OS and reload: everything must be visible and static, nothing missing. Then disable JavaScript and reload: same — nothing hidden, per the `html.js` rule. Finally, check the console is clean and the headings still read correctly to a screen reader (headings should announce whole, not line by line).

**After Phase 4** — confirm the hairline reaches full height exactly as the last chapter leaves, and that it's gone below 1000px.

---

## Deliberately not doing

- No screenshot or Playwright gate this pass — manual review by Russ.
- No changes to `/hof/` beyond what Pass 2 already specifies.
- No WebGL, no new dependencies of any kind.
- No changes to the journey hero mechanic or `/galerie/` — frozen per CLAUDE.md.
- No new imagery. Every frame referenced already exists in `assets-in/`.
