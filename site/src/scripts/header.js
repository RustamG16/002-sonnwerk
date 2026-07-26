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

/* Desktop dropdown: click/tap toggle alongside the existing hover/focus-within CSS —
   touch devices have no real :hover, so the submenu needs an explicit open affordance.
   The trigger is a real link to its own page, so only the FIRST tap is intercepted
   (opens the submenu); a second tap, or tapping a submenu link, navigates normally. */
const dropdownItems = document.querySelectorAll('.nav-item');

function closeDropdown(item) {
  item.classList.remove('is-open');
  item.querySelector(':scope > a[aria-haspopup="true"]')?.setAttribute('aria-expanded', 'false');
}
function closeAllDropdowns() {
  dropdownItems.forEach(closeDropdown);
}

dropdownItems.forEach((item) => {
  const trigger = item.querySelector(':scope > a[aria-haspopup="true"]');
  if (!trigger) return;
  trigger.setAttribute('aria-expanded', 'false');
  trigger.addEventListener('click', (e) => {
    if (item.classList.contains('is-open')) return; // already open — let this tap navigate
    e.preventDefault();
    closeAllDropdowns();
    item.classList.add('is-open');
    trigger.setAttribute('aria-expanded', 'true');
  });
});

document.addEventListener('click', (e) => {
  dropdownItems.forEach((item) => {
    if (item.classList.contains('is-open') && !item.contains(e.target)) closeDropdown(item);
  });
});

document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  if (toggle?.classList.contains('is-open')) closeMenu();
  dropdownItems.forEach((item) => {
    if (!item.classList.contains('is-open') && !item.matches(':focus-within')) return;
    closeDropdown(item);
    // :focus-within keeps the CSS-only hover/focus reveal open regardless of the class
    // above, so whichever descendant (trigger or a submenu link) currently holds focus
    // needs to be blurred — otherwise Escape flips aria-expanded but the panel stays
    // visibly open for keyboard users.
    item.querySelector(':focus')?.blur();
  });
});

/* Theme-aware header: cream .paper-section content scrolling under the fixed dark header
   was getting clipped/muddied (confirmed on both / and /hof/ — docs/awwwards/AUDIT.md).
   Watch a thin band right under the header; if a paper-section occupies it, invert the header. */
if (header) {
  const paperSections = document.querySelectorAll('.paper-section');
  const active = new Set();
  const sync = () => header.classList.toggle('theme-paper', active.size > 0);
  // Thin band just under the header (73px-110px from viewport top) — a section is "under
  // the header" once its box crosses that band. Fixed px, not %, so it doesn't invert on
  // short viewports the way a percentage-only rootMargin can (bottom edge landing above top).
  const bandBottom = () => Math.max(window.innerHeight - 110, 74);
  let io;
  const observe = () => {
    io?.disconnect();
    active.clear();
    io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) active.add(entry.target);
        else active.delete(entry.target);
      });
      sync();
    }, { rootMargin: `-73px 0px -${bandBottom()}px 0px`, threshold: 0 });
    paperSections.forEach((el) => io.observe(el));
  };
  observe();
  window.addEventListener('resize', observe, { passive: true });
}

export {};
