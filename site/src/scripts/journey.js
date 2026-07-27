/* Journey hero: canvas frame scrubbing + chapter copy. Native scroll only —
   Lenis was freezing wheel/trackpad on some Windows laptops while 384 frames load. */
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

if (reduced) {
  section.classList.add('journey--static');
} else if (innerWidth === 0) {
  const wait = () => (innerWidth > 0 ? init() : requestAnimationFrame(wait));
  requestAnimationFrame(wait);
} else {
  init();
}

function init() {
  const scrubber = new FlipbookScrubber(canvas, cfg);
  const n = chapters.length;
  const dpr = () => Math.min(devicePixelRatio || 1, 2);
  let ticking = false;

  function update() {
    ticking = false;
    if (canvas.width !== Math.round(innerWidth * dpr())) {
      scrubber.resize();
      scrubber.draw(scrubber.current < 0 ? 0 : scrubber.current);
    }
    const p = progressOf(section);
    scrubber.setProgress(p);

    if (meterFill) meterFill.style.height = `${p * 100}%`;
    if (meter) meter.classList.toggle('meter--off', section.getBoundingClientRect().bottom <= innerHeight + 1);
    const active = Math.min(n - 1, Math.floor(p * n));
    meterLabels.forEach((el, i) => el.classList.toggle('active', i <= active));

    chapters.forEach((el, i) => {
      const x = p * n - (i + 0.5);
      const d = i === 0 ? Math.max(0, x) : i === n - 1 ? Math.max(0, -x) : Math.abs(x);
      const o = Math.max(0, Math.min(1, 1.6 - d * 2.2));
      el.style.opacity = String(o);
      el.style.transform = `translateY(${(1 - o) * 24}px)`;
      el.style.pointerEvents = o > 0.5 ? 'auto' : 'none';
    });
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  }

  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll, { passive: true });
  update();

  meterLabels.forEach((el, i) => {
    el.addEventListener('click', () => {
      const y = section.offsetTop + ((i + 0.5) / n) * (section.offsetHeight - innerHeight);
      scrollTo({ top: y, behavior: 'smooth' });
    });
  });
}
