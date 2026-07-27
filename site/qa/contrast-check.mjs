/* Measured WCAG contrast for text sitting over photography (not by eye — CLAUDE.md
   verification protocol). For each target: scrolls it into view, hides the text nodes,
   screenshots the raw scrim+photo background at each text line's position, then computes
   the standard contrast ratio against the (possibly translucent) text color composited
   over that sampled background.
   Usage: node qa/contrast-check.mjs */
import { chromium } from "playwright";
import sharp from "sharp";

const BASE = process.env.SCREEN_BASE_URL ?? "http://localhost:4321";

const TARGETS = [
  {
    /* Hero is the LCP element and its frame changed to a much brighter overcast render
       (Gate-1 NANO), so the scrim it was tuned against no longer describes what's behind
       the copy. Measured, not eyeballed. */
    route: "/arbeit-mit-dem-pferd/",
    section: ".p-hero",
    scrollToSectionTop: ".p-hero",
    texts: [
      { sel: ".p-hero .eyebrow", color: { r: 232, g: 163, b: 61 }, alpha: 1, minRatio: 4.5 },
      { sel: ".p-hero h1", color: { r: 242, g: 235, b: 220 }, alpha: 1, minRatio: 3 },
    ],
  },
  {
    route: "/arbeit-mit-dem-pferd/",
    section: ".chapter--energie",
    texts: [
      { sel: ".chapter--energie .eyebrow", color: { r: 232, g: 163, b: 61 }, alpha: 1, minRatio: 4.5 },
      { sel: ".chapter--energie h2", color: { r: 242, g: 235, b: 220 }, alpha: 1, minRatio: 3 },
      { sel: ".chapter--energie .dim", color: { r: 242, g: 235, b: 220 }, alpha: 0.64, minRatio: 4.5 },
    ],
  },
  {
    route: "/arbeit-mit-dem-pferd/",
    section: ".p-vision",
    texts: [
      { sel: ".p-vision .eyebrow", color: { r: 101, g: 77, b: 29 }, alpha: 1, minRatio: 4.5 },
      { sel: ".p-manifesto", color: { r: 13, g: 20, b: 8 }, alpha: 1, minRatio: 4.5 },
    ],
  },
  {
    /* Added when Mitfahren's copy moved to the right half of the frame (Pass 3 Phase 1b) —
       the scrim inverted with it, so this section needs its own measured check. */
    route: "/arbeit-mit-dem-pferd/",
    section: ".p-cta",
    texts: [
      { sel: ".p-cta .eyebrow", color: { r: 232, g: 163, b: 61 }, alpha: 1, minRatio: 4.5 },
      { sel: ".p-cta h2", color: { r: 242, g: 235, b: 220 }, alpha: 1, minRatio: 3 },
    ],
  },
  {
    route: "/arbeit-mit-dem-pferd/",
    section: ".chapter--kultur",
    texts: [{ sel: ".chapter--kultur .eyebrow", color: { r: 101, g: 77, b: 29 }, alpha: 1, minRatio: 4.5 }],
  },
  {
    route: "/",
    section: ".warum",
    texts: [{ sel: ".warum .eyebrow", color: { r: 101, g: 77, b: 29 }, alpha: 1, minRatio: 4.5 }],
  },
  {
    route: "/hof/",
    section: ".cta",
    scrollToSectionTop: ".cta",
    texts: [{ sel: ".logo .gold", color: { r: 232, g: 163, b: 61 }, alpha: 1, minRatio: 4.5 }],
  },
];

function relLum({ r, g, b }) {
  const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}
function contrast(c1, c2) {
  const L1 = relLum(c1), L2 = relLum(c2);
  const [hi, lo] = L1 > L2 ? [L1, L2] : [L2, L1];
  return (hi + 0.05) / (lo + 0.05);
}
function blend(fg, alpha, bg) {
  return { r: fg.r * alpha + bg.r * (1 - alpha), g: fg.g * alpha + bg.g * (1 - alpha), b: fg.b * alpha + bg.b * (1 - alpha) };
}

const browser = await chromium.launch();
let anyFail = false;

for (const target of TARGETS) {
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.goto(`${BASE}${target.route}`, { waitUntil: "networkidle" });
  if (target.scrollToSectionTop) {
    await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 40);
    }, target.scrollToSectionTop);
  } else {
    await page.evaluate((sel) => document.querySelector(sel).scrollIntoView({ block: "center" }), target.section);
  }
  await page.waitForTimeout(400);

  /* Per-LINE boxes, not the element box. A block-level <p> or <h1> is as wide as its
     container even when the glyphs are a fraction of that — .p-hero .eyebrow measures
     1792px wide for ~206px of text. Sampling the element box therefore averaged the dark
     panel behind the words together with the bright photo beside them and reported 4.81:1
     for text that actually sits at ~8.7:1. Range.getClientRects() returns the real line
     boxes, so we sample only where glyphs are, and every line rather than just the middle
     one (the middle line was also hiding worst-case lines over busy photography). */
  const lineRects = await page.evaluate((texts) => {
    return texts.map(({ sel }) => {
      const el = document.querySelector(sel);
      const range = document.createRange();
      range.selectNodeContents(el);
      const rects = [...range.getClientRects()]
        .filter((r) => r.width >= 8 && r.height >= 6)
        .map((r) => ({ left: r.left, top: r.top, width: r.width, height: r.height }));
      if (rects.length) return rects;
      const r = el.getBoundingClientRect();
      return [{ left: r.left, top: r.top, width: r.width, height: r.height }];
    });
  }, target.texts);

  await page.evaluate((texts) => {
    texts.forEach(({ sel }) => { document.querySelector(sel).style.visibility = "hidden"; });
  }, target.texts);
  await page.waitForTimeout(100);

  const buf = await page.screenshot();
  const img = sharp(buf);

  console.log(`\n=== ${target.route} ${target.section} ===`);
  for (let i = 0; i < target.texts.length; i++) {
    const { sel, color, alpha, minRatio } = target.texts[i];
    // Worst line governs — one illegible line is an illegible block.
    let ratio = Infinity;
    let worstLine = 0;
    for (const [li, box] of lineRects[i].entries()) {
      const y = Math.max(0, Math.round(box.top + box.height / 2));
      const x0 = Math.max(0, Math.round(box.left));
      const w = Math.max(1, Math.round(box.width));
      const { data } = await img.clone().extract({ left: x0, top: Math.max(0, y - 2), width: w, height: 4 }).raw().toBuffer({ resolveWithObject: true });
      let r = 0, g = 0, b = 0; const n = data.length / 3;
      for (let j = 0; j < data.length; j += 3) { r += data[j]; g += data[j + 1]; b += data[j + 2]; }
      const bg = { r: Math.round(r / n), g: Math.round(g / n), b: Math.round(b / n) };
      const lineRatio = contrast(blend(color, alpha, bg), bg);
      if (lineRatio < ratio) { ratio = lineRatio; worstLine = li + 1; }
    }
    const lines = lineRects[i].length;
    const pass = ratio >= minRatio;
    if (!pass) anyFail = true;
    const where = lines > 1 ? ` [worst of ${lines} lines: #${worstLine}]` : "";
    console.log(`  ${sel}: ${ratio.toFixed(2)}:1 (needs ${minRatio}:1) — ${pass ? "PASS" : "FAIL"}${where}`);
  }
  await page.close();
}

await browser.close();
process.exitCode = anyFail ? 1 : 0;
