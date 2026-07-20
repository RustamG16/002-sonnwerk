/* Global motion: Lenis (non-journey pages), GSAP ScrollTrigger reveals, parallax, hover loops, accordion */
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const onJourneyPage = !!document.querySelector('[data-journey]');

let lenis = null;

if (!reducedMotion && !onJourneyPage) {
  lenis = new Lenis({ lerp: 0.08 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

/* Stagger scroll reveals (replaces basic IO when GSAP available) */
const reveals = gsap.utils.toArray('.reveal');
if (reveals.length && !reducedMotion) {
  reveals.forEach((el, i) => {
    gsap.fromTo(
      el,
      { opacity: 0, y: 28 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power2.out',
        delay: (i % 4) * 0.08,
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          toggleActions: 'play none none none',
          once: true,
        },
      },
    );
  });
} else {
  reveals.forEach((el) => el.classList.add('in'));
}

/* Galerie teaser parallax */
if (!reducedMotion) {
  document.querySelectorAll('[data-parallax-item]').forEach((img, i) => {
    gsap.to(img, {
      y: (i % 2 === 0 ? -24 : 24),
      ease: 'none',
      scrollTrigger: {
        trigger: img.closest('[data-parallax-teaser]') || img,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 0.6,
      },
    });
  });
}

/* Hover-loop videos on category + product cards */
function wireHoverLoops(root = document) {
  if (reducedMotion) return;
  root.querySelectorAll('.media').forEach((media) => {
    const video = media.querySelector('.hover-video');
    if (!video) return;
    media.closest('.card, .cat')?.addEventListener('mouseenter', () => {
      video.play().catch(() => {});
    });
    media.closest('.card, .cat')?.addEventListener('mouseleave', () => {
      video.pause();
      video.currentTime = 0;
    });
  });
}
wireHoverLoops();

document.querySelectorAll('.hover-video, [data-ambient-video]').forEach((video) => {
  video.addEventListener('error', () => video.remove());
});

export { lenis };
