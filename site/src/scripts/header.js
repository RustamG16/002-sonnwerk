/* Site header: scroll compression, mobile menu, body scroll lock */
const header = document.querySelector('[data-site-header]');
const toggle = document.querySelector('[data-nav-toggle]');
const mobileNav = document.querySelector('[data-mobile-nav]');
const mobileLinks = document.querySelectorAll('[data-mobile-link]');

let scrollTicking = false;

function onScroll() {
  if (!header) return;
  header.classList.toggle('scrolled', window.scrollY > 80);
  scrollTicking = false;
}

window.addEventListener('scroll', () => {
  if (scrollTicking) return;
  scrollTicking = true;
  requestAnimationFrame(onScroll);
}, { passive: true });
onScroll();

function setMenuOpen(open) {
  if (!toggle || !mobileNav) return;
  toggle.classList.toggle('is-open', open);
  mobileNav.classList.toggle('is-open', open);
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', open ? 'Menü schließen' : 'Menü öffnen');
  mobileNav.setAttribute('aria-hidden', String(!open));
  document.body.classList.toggle('no-scroll', open);
}

function closeMenu() {
  setMenuOpen(false);
}

toggle?.addEventListener('click', () => {
  setMenuOpen(!toggle.classList.contains('is-open'));
});

mobileLinks.forEach((link) => link.addEventListener('click', closeMenu));

document.querySelector('[data-mobile-cart]')?.addEventListener('click', closeMenu);

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && toggle?.classList.contains('is-open')) closeMenu();
});

export {};
