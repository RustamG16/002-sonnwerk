/* Journey hero: engine FlipbookScrubber (canvas frame scrubbing — never video.currentTime)
   + right-edge process meter HUD + chapter copy pinned at clip seams + Lenis smooth scroll. */
import Lenis from 'lenis';
import { FlipbookScrubber, progressOf } from './flipbook.js';

const section = document.querySelector('[data-journey]');
const canvas = document.querySelector('[data-journey-canvas]');
if (!section || !canvas) throw new Error('journey markup missing');

const cfg = JSON.parse(section.dataset.frames);
const chapters = [...document.querySelectorAll('[data-chapter]')];
const meter = document.querySelector('.meter');
const meterFill = document.querySelector('[data-meter-fill]');
const meterLabels = [...document.querySelectorAll('[data-meter-label]')];
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* prefers-reduced-motion → poster only, normal scroll, chapters visible as static sections */
if (reduced) {
  section.classList.add('journey--static');
} else if (innerWidth === 0) {
  // viewport not laid out yet (embedded/emulated contexts) — retry until it is
  const wait = () => (innerWidth > 0 ? init() : requestAnimationFrame(wait));
  requestAnimationFrame(wait);
} else {
  init();
}

function init() {
  const scrubber = new FlipbookScrubber(canvas, cfg);

  const lenis = new Lenis({ lerp: 0.1 });
  window.__lenis = lenis; // QA hook — see CLAUDE.md verification protocol
  const n = chapters.length;
  const dpr = () => Math.min(devicePixelRatio || 1, 2);

  function frame(time) {
    lenis.raf(time);
    // some hosts resize the viewport without firing 'resize' — resync the canvas
    if (canvas.width !== Math.round(innerWidth * dpr())) {
      scrubber.resize();
      scrubber.draw(scrubber.current < 0 ? 0 : scrubber.current);
    }
    const p = progressOf(section);
    scrubber.setProgress(p);

    /* meter fill + active label; HUD retires once the journey scrolls out */
    if (meterFill) meterFill.style.height = `${p * 100}%`;
    if (meter) meter.classList.toggle('meter--off', section.getBoundingClientRect().bottom <= innerHeight + 1);
    const active = Math.min(n - 1, Math.floor(p * n));
    meterLabels.forEach((el, i) => el.classList.toggle('active', i <= active));

    /* chapter copy: fade in around each clip's segment, out at the seam.
       First chapter is fully visible from page load (d clamps to 0 before its
       center); last chapter stays visible to the end. */
    chapters.forEach((el, i) => {
      const x = p * n - (i + 0.5);                // signed distance from segment center
      const d = i === 0 ? Math.max(0, x) : i === n - 1 ? Math.max(0, -x) : Math.abs(x);
      const o = Math.max(0, Math.min(1, 1.6 - d * 2.2));
      el.style.opacity = o;
      el.style.transform = `translateY(${(1 - o) * 24}px)`;
      el.style.pointerEvents = o > 0.5 ? 'auto' : 'none';
    });

    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  /* meter doubles as chapter nav */
  meterLabels.forEach((el, i) => {
    el.addEventListener('click', () => {
      const y = section.offsetTop + ((i + 0.5) / n) * (section.offsetHeight - innerHeight);
      lenis.scrollTo(y);
    });
  });
}
