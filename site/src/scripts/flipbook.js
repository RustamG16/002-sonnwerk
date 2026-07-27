/* ---------- FlipbookScrubber (engine/flipbook-scrubber.js, ESM port) ----------
   Canvas frame-sequence scrubber:
   - coarse-first preloading (every 8th frame, then fill)
   - lab/002 payload strategy: eager region (clips 1–2) first, lazy region (clips 3–4)
     fills only after the eager region is done — user is still scrolling chapter 1
   - nearest-loaded-frame fallback while loading
   - cover-fit draw, devicePixelRatio aware */
export class FlipbookScrubber {
  constructor(canvas, cfg) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.cfg = cfg;
    this.isMobile = innerWidth < 768 && !!cfg.mobilePath;
    this.count = this.isMobile ? (cfg.mobileCount || cfg.count) : cfg.count;
    this.lazyStart = Math.floor(this.count * (cfg.eagerFraction ?? 0.5));
    this.images = new Array(this.count).fill(null);
    this.loaded = new Set();
    this.current = -1;
    this.resize();
    addEventListener('resize', () => { this.resize(); this.draw(this.current < 0 ? 0 : this.current); });
    this.preload();
  }
  src(i) {
    const n = String(i + 1).padStart(this.cfg.pad, '0');
    const base = this.isMobile ? this.cfg.mobilePath : this.cfg.path;
    return `${base}${n}${this.cfg.ext}`;
  }
  load(i) {
    if (this.images[i]) return;
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => {
      this.loaded.add(i);
      if (this.current === -1 && i === 0) this.draw(0);
      else if (i === this.current) this.draw(i);   // upgrade a fallback draw
    };
    img.src = this.src(i);
    this.images[i] = img;
  }
  preload() {
    this.load(0);
    for (let i = 0; i < this.lazyStart; i += 8) this.load(i);      // coarse pass, eager region
    const idle = (fn) => (window.requestIdleCallback ? requestIdleCallback(fn) : setTimeout(fn, 60));
    let i = 0;
    const fill = () => {
      let done = 0;
      while (i < this.count && done < 6) { this.load(i); i++; done++; }
      if (i === this.lazyStart) for (let k = this.lazyStart; k < this.count; k += 8) this.load(k); // coarse pass, lazy region
      if (i < this.count) idle(fill);
    };
    idle(fill);
  }
  nearestLoaded(i) {
    if (this.loaded.has(i)) return i;
    for (let d = 1; d < this.count; d++) {
      if (this.loaded.has(i - d)) return i - d;
      if (this.loaded.has(i + d)) return i + d;
    }
    return -1;
  }
  resize() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    this.canvas.width = innerWidth * dpr;
    this.canvas.height = innerHeight * dpr;
  }
  draw(i) {
    const j = this.nearestLoaded(i);
    if (j < 0) return;
    this.current = i;
    const img = this.images[j];
    const cw = this.canvas.width, ch = this.canvas.height;
    const s = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);   // cover
    const w = img.naturalWidth * s, h = img.naturalHeight * s;
    this.ctx.clearRect(0, 0, cw, ch);
    this.ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
  }
  setProgress(p) {
    const i = Math.max(0, Math.min(this.count - 1, Math.round(p * (this.count - 1))));
    if (i !== this.current) this.draw(i);
  }
}

/* section progress helper (0..1 through a tall wrapper) */
export const progressOf = (el) => {
  const r = el.getBoundingClientRect();
  const total = el.offsetHeight - innerHeight;
  return total <= 0 ? 1 : Math.max(0, Math.min(1, -r.top / total));
};
