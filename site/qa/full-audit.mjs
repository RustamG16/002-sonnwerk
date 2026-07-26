/* Quick health sweep: every route, console/pageerror/4xx capture, scroll-through
   to trigger lazy/IO behavior, hover on first card, and a payload guard (P8: fail if any
   route ships >2.5MB of non-journey imagery — the journey flipbook frames have their own,
   separately-budgeted allowance and are excluded). Ported from
   lab/005-agency/scripts/full-audit.mjs.  Usage:  node qa/full-audit.mjs
   Each route gets its own fresh browser context — sharing one context/cache across routes
   let a later route "cache-hit" images an earlier route already loaded, undercounting it. */
import { chromium } from "playwright";

const BASE = process.env.SCREEN_BASE_URL ?? "http://localhost:4321";
const ROUTES = ["/", "/shop/", "/shop/oel/", "/shop/tee/", "/shop/tierprodukte/", "/produkt/bio-cbd-oel-5/", "/produkt/hanftee-bud/", "/hof/", "/galerie/", "/arbeit-mit-dem-pferd/", "/warenkorb/", "/impressum/", "/agb/", "/datenschutz/"];
// /404 is deliberately excluded — it always answers with an HTTP 404 status by design,
// which would show up as a permanent false-positive "issue" in this generic health sweep.
// It's covered visually instead by qa/screenshot.mjs's route list.
const PAYLOAD_LIMIT_MB = 2.5;
const isJourneyAsset = (url) => url.includes("/media/journey/") || url.includes("/media/journey-mobile/");
const isImageOrVideo = (headers) => /^image\/|^video\//.test(headers["content-type"] ?? "");

const browser = await chromium.launch();
const issues = [];

for (const route of ROUTES) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  page.on("console", (m) => m.type() === "error" && issues.push(`[console] ${page.url()}: ${m.text()}`));
  page.on("pageerror", (e) => issues.push(`[pageerror] ${page.url()}: ${e.message}`));
  page.on("response", (res) => res.status() >= 400 && issues.push(`[http ${res.status()}] ${res.url()}`));

  let bytes = 0;
  page.on("response", async (res) => {
    if (isJourneyAsset(res.url()) || !isImageOrVideo(res.headers())) return;
    const len = res.headers()["content-length"];
    if (len) { bytes += Number(len); return; }
    try { bytes += (await res.body()).length; } catch { /* opaque/redirected response, skip */ }
  });

  await page.goto(`${BASE}${route}`, { waitUntil: "load", timeout: 60000 });
  await page.waitForTimeout(500);

  const scrollHeight = await page.evaluate(() => document.documentElement.scrollHeight);
  const steps = 8;
  for (let i = 1; i <= steps; i++) {
    await page.evaluate((y) => window.scrollTo(0, y), Math.round((scrollHeight * i) / steps));
    await page.waitForTimeout(250);
  }
  await page.evaluate(() => window.scrollTo(0, 0));

  const firstCard = page.locator(".cat, .card, article").first();
  if (await firstCard.count()) {
    await firstCard.hover().catch(() => {});
    await page.waitForTimeout(300);
  }

  const mb = bytes / (1024 * 1024);
  if (mb > PAYLOAD_LIMIT_MB) issues.push(`[payload] ${route}: ${mb.toFixed(2)}MB non-journey imagery (limit ${PAYLOAD_LIMIT_MB}MB)`);
  console.log(`checked ${route} (scrollHeight=${scrollHeight}, imagery=${mb.toFixed(2)}MB)`);
  await context.close();
}

await browser.close();

console.log("\n=== issues ===");
if (issues.length === 0) console.log("none");
else { issues.forEach((i) => console.log(i)); process.exitCode = 1; }
