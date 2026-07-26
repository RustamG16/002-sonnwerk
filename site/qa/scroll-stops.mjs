/* Screenshot a route at N scroll stops — this is how you SEE the journey scrub,
   chapter fades, meter fill, and every scroll-triggered reveal. Ported from
   lab/005-agency/scripts/scroll-stops.mjs.
   Usage:  node qa/scroll-stops.mjs            (homepage, 14 stops, 1440x900)
           SCREEN_ROUTE=/hof/ SCREEN_STOPS=10 node qa/scroll-stops.mjs
   For the journey hero use SCREEN_STOPS>=16 so every chapter + seam is captured. */
import { chromium } from "playwright";
import path from "node:path";
import fs from "node:fs";

const BASE = process.env.SCREEN_BASE_URL ?? "http://localhost:4321";
const ROUTE = process.env.SCREEN_ROUTE ?? "/";
const STOPS = Number(process.env.SCREEN_STOPS ?? 14);
const WIDTH = Number(process.env.SCREEN_WIDTH ?? 1440);
const HEIGHT = Number(process.env.SCREEN_HEIGHT ?? 900);
const OUT_DIR = path.resolve("qa", "screenshots", "stops");
fs.mkdirSync(OUT_DIR, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: WIDTH, height: HEIGHT } });
const page = await context.newPage();
const errors = [];
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
page.on("pageerror", (e) => errors.push(e.message));

await page.goto(`${BASE}${ROUTE}`, { waitUntil: "load", timeout: 60000 });
// journey frames load lazily — give the eager region time
await page.waitForTimeout(2500);

// Freeze ambient motion so diffs show scrub choreography, not autoplay/CSS pulse noise.
await page.addStyleTag({
  content: [
    "*, *::before, *::after { animation: none !important; transition: none !important; }",
    ".grain::after, [class*='cursor'], [class*='Cursor'] { opacity: 0 !important; visibility: hidden !important; }",
  ].join("\n"),
});
await page.evaluate(() => {
  document.querySelectorAll("video").forEach((v) => { try { v.pause(); v.currentTime = 0; } catch {} });
});
await page.waitForTimeout(200);

const scrollHeight = await page.evaluate(() => document.documentElement.scrollHeight);
const maxScroll = scrollHeight - HEIGHT;

for (let i = 0; i < STOPS; i++) {
  const y = Math.round((maxScroll * i) / (STOPS - 1));
  await page.evaluate((y) => {
    // journey.js / motion.js should expose window.__lenis for QA (see CLAUDE.md)
    if (window.__lenis) window.__lenis.scrollTo(y, { immediate: true });
    else window.scrollTo(0, y);
  }, y);
  await page.waitForTimeout(500); // let rAF loop + canvas draw settle
  const file = path.join(OUT_DIR, `${String(i).padStart(2, "0")}-y${y}.png`);
  await page.screenshot({ path: file });
  console.log(`saved ${file}`);
}

await browser.close();

if (errors.length) {
  console.log("\n=== errors ===");
  errors.forEach((e) => console.log(e));
  process.exitCode = 1;
} else {
  console.log("\nNo console/page errors.");
}
