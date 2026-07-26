/* Full-page screenshots of every route at 3 viewports + console/pageerror capture.
   Ported from lab/005-agency/scripts/screenshot.mjs (the setup that made the agency
   pass verifiable). Usage:  node qa/screenshot.mjs   (dev server on :4321)
   Env: SCREEN_BASE_URL, SCREEN_ROUTES (comma list), SCREEN_SCROLL=1 */
import { chromium } from "playwright";
import path from "node:path";
import fs from "node:fs";

const BASE = process.env.SCREEN_BASE_URL ?? "http://localhost:4321";
const OUT_DIR = path.resolve("qa", "screenshots");
fs.mkdirSync(OUT_DIR, { recursive: true });

const ROUTES = (
  process.env.SCREEN_ROUTES ??
  "/,/shop/,/shop/oel/,/shop/tee/,/produkt/bio-cbd-oel-5/,/hof/,/galerie/,/arbeit-mit-dem-pferd/,/warenkorb/,/impressum/,/404"
).split(",");

const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "desktop-fhd", width: 1920, height: 1080 },
  { name: "mobile", width: 390, height: 844 },
];

const SCROLL = process.env.SCREEN_SCROLL === "1";

const slug = (r) => (r === "/" ? "home" : r.replace(/^\/|\/$/g, "").replace(/\//g, "-"));

const browser = await chromium.launch();
const errors = [];

for (const viewport of VIEWPORTS) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  page.on("console", (m) => m.type() === "error" && errors.push(`[${viewport.name}] console: ${m.text()}`));
  page.on("pageerror", (e) => errors.push(`[${viewport.name}] pageerror: ${e.message}`));
  page.on("response", (res) => res.status() >= 400 && errors.push(`[${viewport.name}] http ${res.status()}: ${res.url()}`));

  for (const route of ROUTES) {
    const url = `${BASE}${route}`;
    await page.goto(url, { waitUntil: "networkidle", timeout: 60000 }).catch(async () => {
      await page.goto(url, { waitUntil: "load", timeout: 60000 });
    });
    await page.waitForTimeout(600);

    // fullPage screenshots resize the viewport rather than actually scrolling, so
    // scroll-linked GSAP/ScrollTrigger reveals (.reveal, opacity:0 until triggered)
    // never fire and every route would render its below-the-fold content as blank.
    // Walk the page top-to-bottom first so "once" reveals lock in their end state.
    const scrollHeight = await page.evaluate(() => document.documentElement.scrollHeight);
    const walkSteps = 10;
    for (let i = 1; i <= walkSteps; i++) {
      await page.evaluate((y) => window.scrollTo(0, y), Math.round((scrollHeight * i) / walkSteps));
      await page.waitForTimeout(150);
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(300);

    const file = path.join(OUT_DIR, `${slug(route)}-${viewport.name}.png`);
    await page.screenshot({ path: file, fullPage: true });
    console.log(`saved ${file}`);

    if (SCROLL) {
      await page.mouse.wheel(0, viewport.height * 3);
      await page.waitForTimeout(400);
      const scrollFile = path.join(OUT_DIR, `${slug(route)}-${viewport.name}-scrolled.png`);
      await page.screenshot({ path: scrollFile, fullPage: false });
      console.log(`saved ${scrollFile}`);
    }
  }
  await context.close();
}

await browser.close();

if (errors.length) {
  console.log("\n=== console/page/network errors ===");
  errors.forEach((e) => console.log(e));
  process.exitCode = 1;
} else {
  console.log("\nNo console, page, or network errors captured.");
}
