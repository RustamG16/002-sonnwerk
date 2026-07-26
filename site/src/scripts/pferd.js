/* /arbeit-mit-dem-pferd/ page behavior: sticky tag rail highlight + the Zugleine trace line. */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* --- Sticky tag rail: highlight the chapter currently centered in view --- */
const railLinks = document.querySelectorAll('.p-rail a[data-tag]');
const chapters = document.querySelectorAll('.chapter[data-chapter]');

if (railLinks.length && chapters.length) {
  const byId = new Map();
  railLinks.forEach((a) => byId.set(a.getAttribute('href').slice(1), a));

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const link = byId.get(entry.target.id);
        if (!link) return;
        railLinks.forEach((a) => a.classList.remove('active'));
        link.classList.add('active');
      });
    },
    { rootMargin: '-40% 0px -40% 0px', threshold: 0 },
  );
  chapters.forEach((el) => io.observe(el));
}

/* --- Masked image reveals (P3): clip-path wipe instead of the site's uniform fade-up.
   Skipped entirely under reduced-motion — the page's own CSS media query already shows
   these images plain, and starting a GSAP tween here would set an inline clip-path that
   overrides that CSS fallback. --- */
if (!reducedMotion) {
  const masks = gsap.utils.toArray('.reveal-mask');
  masks.forEach((el, i) => {
    gsap.fromTo(
      el,
      { clipPath: 'inset(0 0 100% 0)' },
      {
        clipPath: 'inset(0 0 0% 0)',
        duration: 0.9,
        ease: 'power2.out',
        delay: (i % 3) * 0.06,
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      },
    );
  });
}

export {};
