/* Placeholder cart: localStorage only. Replaced by Woo Store API wiring (cart CORS/nonce — see sitespec risk). */
const KEY = 'sonnwerk-cart-v1';

const read = () => { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; } };
const write = (items) => { localStorage.setItem(KEY, JSON.stringify(items)); render(); };
const euro = (n) => `€${n.toFixed(2).replace('.', ',')}`;

function add(slug, name, price, qty = 1) {
  const items = read();
  const line = items.find((i) => i.slug === slug);
  if (line) line.qty += qty; else items.push({ slug, name, price, qty });
  write(items);
  open();
}

function setQty(slug, qty) {
  let items = read();
  items = qty <= 0 ? items.filter((i) => i.slug !== slug) : items.map((i) => (i.slug === slug ? { ...i, qty } : i));
  write(items);
}

const drawer = document.querySelector('[data-cart-drawer]');
const overlay = document.querySelector('[data-cart-overlay]');

function open() { drawer.hidden = false; overlay.hidden = false; }
function close() { drawer.hidden = true; overlay.hidden = true; }

function render() {
  const items = read();
  const count = items.reduce((s, i) => s + i.qty, 0);
  const total = items.reduce((s, i) => s + i.qty * i.price, 0);
  document.querySelectorAll('[data-cart-count]').forEach((el) => (el.textContent = count));
  const totalEl = document.querySelector('[data-cart-total]');
  if (totalEl) totalEl.textContent = euro(total);
  const box = document.querySelector('[data-cart-items]');
  if (!box) return;
  box.innerHTML = items.length
    ? items.map((i) => `
        <div class="cart-line">
          <span>${i.name}</span>
          <span class="qty-controls">
            <button data-dec="${i.slug}" aria-label="weniger">−</button>${i.qty}<button data-inc="${i.slug}" aria-label="mehr">+</button>
          </span>
          <span class="price">${euro(i.price * i.qty)}</span>
        </div>`).join('')
    : '<p class="dim empty">Dein Warenkorb ist leer.</p>';
}

document.addEventListener('click', (e) => {
  const t = e.target.closest('[data-add-to-cart],[data-cart-open],[data-cart-close],[data-cart-overlay],[data-inc],[data-dec]');
  if (!t) return;
  if (t.hasAttribute('data-add-to-cart')) {
    const qtyInput = document.querySelector('[data-qty-input]');
    add(t.dataset.slug, t.dataset.name, parseFloat(t.dataset.price), qtyInput ? Math.max(1, parseInt(qtyInput.value, 10) || 1) : 1);
  } else if (t.hasAttribute('data-cart-open')) open();
  else if (t.hasAttribute('data-cart-close') || t.hasAttribute('data-cart-overlay')) close();
  else if (t.dataset.inc) setQty(t.dataset.inc, read().find((i) => i.slug === t.dataset.inc).qty + 1);
  else if (t.dataset.dec) setQty(t.dataset.dec, read().find((i) => i.slug === t.dataset.dec).qty - 1);
});

render();
