import { connect } from "puppeteer-real-browser";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT_BASE = path.join(ROOT, "assets-in", "gate0");

const MIN_VALID_BYTES = 10 * 1024;
const FAILURES_LOG = path.join(OUT_BASE, "gate0-failures.log");
const MAX_DOWNLOAD_CONCURRENCY = 2;
const RETRY_DELAY_MS = 1500;
const MAX_RETRY_ATTEMPTS = 2;

const CATEGORIES = ["horse", "farm", "bottle", "product", "logo"];

const PAGE_JOBS = [
  { url: "https://sonn-werk.at/arbeit-mit-dem-pferd/", category: "horse" },
  { url: "https://sonn-werk.at/hanf1/", category: "farm" },
  { url: "https://sonn-werk.at/produkt-kategorie/oel/", category: "bottle" },
  {
    url: "https://sonn-werk.at/produkt-kategorie/cbd-gel/",
    category: "product",
  },
  {
    url: "https://sonn-werk.at/produkt-kategorie/cbd-balsam/",
    category: "product",
  },
  { url: "https://sonn-werk.at/produkt-kategorie/tee/", category: "product" },
  {
    url: "https://sonn-werk.at/produkt-kategorie/selfcare/",
    category: "product",
  },
  { url: "https://sonn-werk.at/", category: "logo" },
];

const LOGO_FILENAMES = new Set([
  "Logo-Natur-die-wirkt-lang.png",
  "cropped-Logo-SonnwerkSolo-270x270.png",
]);

const LOGO_FALLBACK_URLS = [
  "https://sonn-werk.at/wp-content/uploads/2024/12/Logo-Natur-die-wirkt-lang.png",
  "https://sonn-werk.at/wp-content/uploads/2024/09/cropped-Logo-SonnwerkSolo-270x270.png",
];

const EXTRACT_IMAGES_FN = (category, logoFilenames) => {
  const logoNames = new Set(logoFilenames);

  const isExcluded = (url) => {
    if (!url) return true;
    if (url.includes("images.prismic.io")) return true;
    if (url.includes("cbd-vital.at")) return true;
    if (category !== "logo") {
      const name = filenameFromUrl(url);
      if (/^Logo-/i.test(name)) return true;
      if (/Versanddienstleister/i.test(name)) return true;
    }
    return false;
  };

  const hasUploadsPath = (url) => url && url.includes("/wp-content/uploads/");

  const pickBestUrl = (img) => {
    const srcset = img.getAttribute("srcset");
    if (srcset) {
      const candidates = srcset
        .split(",")
        .map((part) => part.trim())
        .map((part) => {
          const match = part.match(/^(\S+)\s+(\d+)w$/);
          if (!match) return null;
          return { url: match[1], width: Number(match[2]) };
        })
        .filter(Boolean)
        .filter((c) => hasUploadsPath(c.url) && !isExcluded(c.url));

      if (candidates.length) {
        candidates.sort((a, b) => b.width - a.width);
        return candidates[0].url;
      }
    }

    const src = img.getAttribute("src") || img.currentSrc || "";
    if (hasUploadsPath(src) && !isExcluded(src)) return src;
    return null;
  };

  const filenameFromUrl = (url) => {
    try {
      return decodeURIComponent(new URL(url).pathname.split("/").pop() || "");
    } catch {
      return "";
    }
  };

  const root =
    category === "logo"
      ? document
      : document.querySelector("main") ||
        document.querySelector("#content") ||
        document.querySelector(".site-content") ||
        document.querySelector(".content-area") ||
        document.querySelector("#primary") ||
        document.body;

  const imgs = Array.from(root.querySelectorAll("img"));
  const urls = [];

  for (const img of imgs) {
    const url = pickBestUrl(img);
    if (!url) continue;
    if (category === "logo") {
      const name = filenameFromUrl(url);
      if (!logoNames.has(name)) continue;
    }
    urls.push(url);
  }

  return [...new Set(urls)];
};

const EXTRACT_PRODUCT_LINKS_FN = () => {
  const main =
    document.querySelector("main") ||
    document.querySelector("#content") ||
    document.querySelector(".site-content") ||
    document.querySelector(".content-area") ||
    document.querySelector("#primary") ||
    document.body;

  const links = Array.from(main.querySelectorAll("a[href]"))
    .map((a) => a.href)
    .filter((href) => /\/produkt\/bio-cbd-oel-/i.test(href));

  return [...new Set(links)];
};

const SCROLL_INTO_VIEW_FN = (imageUrl) => {
  const targetName = (() => {
    try {
      return decodeURIComponent(new URL(imageUrl).pathname.split("/").pop() || "");
    } catch {
      return "";
    }
  })();

  const matches = (value) =>
    value && (value === imageUrl || value.includes(targetName));

  for (const img of document.querySelectorAll("img")) {
    const src = img.getAttribute("src") || img.currentSrc || "";
    const srcset = img.getAttribute("srcset") || "";
    if (matches(src) || srcset.includes(targetName)) {
      img.scrollIntoView({ behavior: "instant", block: "center" });
      return true;
    }
  }
  return false;
};

function filenameFromUrl(url) {
  const parsed = new URL(url);
  return decodeURIComponent(path.basename(parsed.pathname.split("?")[0]));
}

function shouldSaveImage(url, category) {
  if (!url || !url.includes("/wp-content/uploads/")) return false;
  if (url.includes("images.prismic.io")) return false;
  if (url.includes("cbd-vital.at")) return false;

  const name = filenameFromUrl(url);
  if (category !== "logo") {
    if (/^Logo-/i.test(name)) return false;
    if (/Versanddienstleister/i.test(name)) return false;
  } else if (!LOGO_FILENAMES.has(name)) {
    return false;
  }

  return true;
}

function validateImageBuffer(contentType, buffer) {
  if (!(contentType || "").startsWith("image/")) {
    return { ok: false, reason: `content-type: ${contentType || "(missing)"}` };
  }
  if (buffer.length < MIN_VALID_BYTES) {
    return {
      ok: false,
      reason: `size: ${buffer.length} bytes (< ${MIN_VALID_BYTES})`,
    };
  }
  return { ok: true };
}

function isThumbnailFilename(name) {
  const match = name.match(/-(\d+)x(\d+)\.(jpe?g|png|webp|gif)$/i);
  if (!match) return false;
  const w = Number(match[1]);
  const h = Number(match[2]);
  return Math.max(w, h) <= 1024;
}

class ConcurrencyLimiter {
  constructor(max) {
    this.max = max;
    this.running = 0;
    this.queue = [];
  }

  run(fn) {
    return new Promise((resolve, reject) => {
      this.queue.push({ fn, resolve, reject });
      this.pump();
    });
  }

  pump() {
    while (this.running < this.max && this.queue.length) {
      const { fn, resolve, reject } = this.queue.shift();
      this.running += 1;
      Promise.resolve()
        .then(fn)
        .then(resolve, reject)
        .finally(() => {
          this.running -= 1;
          this.pump();
        });
    }
  }

  async drain() {
    while (this.running > 0 || this.queue.length > 0) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }
}

async function isValidOnDisk(dest) {
  try {
    const stat = await fs.stat(dest);
    return stat.isFile() && stat.size >= MIN_VALID_BYTES;
  } catch {
    return false;
  }
}

async function ensureDirs() {
  await fs.mkdir(OUT_BASE, { recursive: true });
  for (const cat of CATEGORIES) {
    await fs.mkdir(path.join(OUT_BASE, cat), { recursive: true });
  }
}

async function initFailuresLog() {
  await fs.writeFile(FAILURES_LOG, "", "utf8");
}

function createFailureLogger() {
  return async (url, category, reason) => {
    const line = `${new Date().toISOString()} | ${category} | ${url} | ${reason}\n`;
    await fs.appendFile(FAILURES_LOG, line, "utf8");
    console.warn(`  [failed] ${category}/${filenameFromUrl(url)} — ${reason}`);
  };
}

async function cleanupCorruptFiles() {
  let removed = 0;

  async function walk(dir) {
    let entries;
    try {
      entries = await fs.readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(full);
        continue;
      }
      if (entry.name === "gate0-failures.log") continue;
      const stat = await fs.stat(full);
      if (stat.isFile() && stat.size < MIN_VALID_BYTES) {
        await fs.unlink(full);
        removed += 1;
      }
    }
  }

  await walk(OUT_BASE);
  return removed;
}

async function writeValidatedImage(dest, contentType, buffer, url, category, stats, logFailure) {
  const validation = validateImageBuffer(contentType, buffer);
  if (!validation.ok) {
    await logFailure(url, category, validation.reason);
    stats.failed += 1;
    return false;
  }

  await fs.writeFile(dest, buffer);
  stats.downloaded += 1;
  return true;
}

function createImageCapture(page, category, stats, logFailure) {
  const capturedUrls = new Set();
  const inFlight = new Set();
  const limiter = new ConcurrencyLimiter(MAX_DOWNLOAD_CONCURRENCY);

  const handler = (response) => {
    limiter
      .run(async () => {
        let url;
        try {
          const request = response.request();
          if (request.resourceType() !== "image") return;

          url = response.url();
          if (!shouldSaveImage(url, category)) return;

          const filename = filenameFromUrl(url);
          const dest = path.join(OUT_BASE, category, filename);

          if (await isValidOnDisk(dest)) {
            capturedUrls.add(url);
            stats.skipped += 1;
            return;
          }

          if (inFlight.has(url)) return;
          inFlight.add(url);

          const headers = response.headers();
          const contentType = headers["content-type"] || "";
          const buffer = Buffer.from(await response.buffer());

          const ok = await writeValidatedImage(
            dest,
            contentType,
            buffer,
            url,
            category,
            stats,
            logFailure,
          );
          if (ok) {
            capturedUrls.add(url);
            console.log(`  [captured] ${category}/${filename}`);
          }
        } catch {
          if (url) {
            await logFailure(url, category, "response buffer error");
            stats.failed += 1;
          }
        } finally {
          if (url) inFlight.delete(url);
        }
      })
      .catch(() => {});
  };

  page.on("response", handler);

  return {
    capturedUrls,
    detach: () => page.off("response", handler),
    flush: () => limiter.drain(),
  };
}

async function fetchImageInBrowser(page, url) {
  const cookies = await page.cookies();
  const cookieHeader = cookies.map((c) => `${c.name}=${c.value}`).join("; ");
  const userAgent = await page.evaluate(() => navigator.userAgent);

  return page.evaluate(
    async ({ imageUrl, cookie, ua }) => {
      const res = await fetch(imageUrl, {
        credentials: "include",
        headers: {
          Cookie: cookie,
          "User-Agent": ua,
        },
      });
      const contentType = res.headers.get("content-type") || "";
      if (!res.ok) {
        return { ok: false, contentType, data: null };
      }
      const buf = await res.arrayBuffer();
      const bytes = new Uint8Array(buf);
      let binary = "";
      for (let i = 0; i < bytes.length; i += 1) {
        binary += String.fromCharCode(bytes[i]);
      }
      return { ok: true, contentType, data: btoa(binary) };
    },
    { imageUrl: url, cookie: cookieHeader, ua: userAgent },
  );
}

async function trySaveFromBrowser(page, url, category, stats, logFailure, capturedUrls) {
  const filename = filenameFromUrl(url);
  const dest = path.join(OUT_BASE, category, filename);

  if (await isValidOnDisk(dest)) {
    capturedUrls.add(url);
    stats.skipped += 1;
    return true;
  }

  const payload = await fetchImageInBrowser(page, url);
  if (!payload.ok || !payload.data) {
    await logFailure(url, category, `browser fetch failed: ${payload.contentType || "no data"}`);
    stats.failed += 1;
    return false;
  }

  const buffer = Buffer.from(payload.data, "base64");
  const ok = await writeValidatedImage(
    dest,
    payload.contentType,
    buffer,
    url,
    category,
    stats,
    logFailure,
  );
  if (ok) {
    capturedUrls.add(url);
    console.log(`  [fallback] ${category}/${filename}`);
  }
  return ok;
}

function urlsMatch(responseUrl, targetUrl) {
  const a = targetUrl.split("?")[0];
  const b = responseUrl.split("?")[0];
  return b === a || b.endsWith(filenameFromUrl(targetUrl));
}

async function retryMissedImages(page, capture, urls, category, stats, logFailure) {
  const missed = [];
  for (const url of urls) {
    const dest = path.join(OUT_BASE, category, filenameFromUrl(url));
    if (capture.capturedUrls.has(url) || (await isValidOnDisk(dest))) continue;
    missed.push(url);
  }

  if (!missed.length) return;

  console.log(`  retrying ${missed.length} missed image(s) in-session...`);

  for (const url of missed) {
    let saved = false;

    for (let attempt = 1; attempt <= MAX_RETRY_ATTEMPTS && !saved; attempt += 1) {
      if (attempt > 1) {
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
      }

      try {
        const responsePromise = page.waitForResponse(
          (res) =>
            res.request().resourceType() === "image" && urlsMatch(res.url(), url),
          { timeout: 5000 },
        );

        await page.evaluate(SCROLL_INTO_VIEW_FN, url);
        await responsePromise.catch(() => {});
        await capture.flush();

        if (capture.capturedUrls.has(url) || (await isValidOnDisk(path.join(OUT_BASE, category, filenameFromUrl(url))))) {
          saved = true;
        }
      } catch {
        // try next attempt or fallback
      }
    }

    if (!saved) {
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
      saved = await trySaveFromBrowser(
        page,
        url,
        category,
        stats,
        logFailure,
        capture.capturedUrls,
      );
    }

    if (!saved) {
      await logFailure(url, category, "all retry attempts exhausted");
    }
  }
}

async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let total = 0;
      const distance = 400;
      const timer = setInterval(() => {
        const { scrollHeight } = document.body;
        window.scrollBy(0, distance);
        total += distance;
        if (total >= scrollHeight) {
          clearInterval(timer);
          window.scrollTo(0, 0);
          resolve();
        }
      }, 200);
    });
  });
  await new Promise((resolve) => setTimeout(resolve, 1000));
}

async function extractImages(page, category) {
  return page.evaluate(EXTRACT_IMAGES_FN, category, [...LOGO_FILENAMES]);
}

async function extractProductLinks(page) {
  return page.evaluate(EXTRACT_PRODUCT_LINKS_FN);
}

async function waitForRealPage(page, url, attempts = 8) {
  for (let i = 0; i < attempts; i += 1) {
    const response = await page.goto(url, {
      waitUntil: "networkidle2",
      timeout: 90000,
    });
    const status = response?.status?.() ?? 0;
    const title = await page.title();
    const uploadCount = await page.evaluate(
      () =>
        Array.from(document.querySelectorAll("img")).filter((img) => {
          const src = img.getAttribute("src") || "";
          const srcset = img.getAttribute("srcset") || "";
          return (
            src.includes("/wp-content/uploads/") ||
            srcset.includes("/wp-content/uploads/")
          );
        }).length,
    );

    if (
      status < 400 &&
      !/robot challenge/i.test(title) &&
      (uploadCount > 0 || url.endsWith("/"))
    ) {
      return { status, title, uploadCount };
    }

    console.warn(
      `  challenge/retry ${i + 1}/${attempts}: HTTP ${status}, "${title}", uploads=${uploadCount}`,
    );
    await new Promise((resolve) => setTimeout(resolve, 3000));
  }

  const title = await page.title();
  return { status: 0, title, uploadCount: 0 };
}

async function scrapePage(page, url, category, stats, logFailure) {
  const capture = createImageCapture(page, category, stats, logFailure);

  try {
    const { title, uploadCount } = await waitForRealPage(page, url);
    if (/robot challenge/i.test(title) || uploadCount === 0) {
      console.warn(`  warning: blocked or empty for ${url} ("${title}")`);
    } else {
      console.log(`  loaded (${uploadCount} upload images on page)`);
    }

    await autoScroll(page);
    await capture.flush();

    let urls = await extractImages(page, category);
    if (category === "logo") {
      urls = [...new Set([...urls, ...LOGO_FALLBACK_URLS])];
    }

    console.log(`  kept ${urls.length} image URL(s) for ${category}/`);
    await retryMissedImages(page, capture, urls, category, stats, logFailure);
    await capture.flush();

    console.log(
      `  session result: ${capture.capturedUrls.size} image(s) saved for ${category}/`,
    );

    if (url.includes("/produkt-kategorie/oel/")) {
      return extractProductLinks(page);
    }
    return [];
  } finally {
    capture.detach();
    await capture.flush();
  }
}

async function listFolderFiles(category) {
  const dir = path.join(OUT_BASE, category);
  try {
    const entries = await fs.readdir(dir);
    return entries.filter((f) => !f.startsWith("."));
  } catch {
    return [];
  }
}

async function folderManifest(category) {
  const files = await listFolderFiles(category);
  const undersized = [];

  for (const file of files) {
    const dest = path.join(OUT_BASE, category, file);
    const stat = await fs.stat(dest);
    if (stat.size < MIN_VALID_BYTES) undersized.push(file);
  }

  return { count: files.length, undersized, files };
}

async function readFailuresLog() {
  try {
    const content = await fs.readFile(FAILURES_LOG, "utf8");
    return content
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}

async function main() {
  await ensureDirs();

  const removed = await cleanupCorruptFiles();
  console.log(`Removed ${removed} corrupt file(s) under 10KB.\n`);

  await initFailuresLog();
  const logFailure = createFailureLogger();
  const stats = { downloaded: 0, skipped: 0, failed: 0 };

  const { browser, page } = await connect({
    headless: false,
    turnstile: true,
    args: ["--window-size=1440,900"],
  });

  try {
    let oilProductLinks = [];

    console.log("Warming session on homepage...");
    await waitForRealPage(page, "https://sonn-werk.at/");

    for (const job of PAGE_JOBS) {
      console.log(`Scraping ${job.url} → ${job.category}/`);
      const links = await scrapePage(page, job.url, job.category, stats, logFailure);
      if (links.length) oilProductLinks = links;
    }

    for (const productUrl of oilProductLinks) {
      console.log(`Scraping ${productUrl} → bottle/`);
      await scrapePage(page, productUrl, "bottle", stats, logFailure);
    }

    console.log("\n=== GATE 0 ASSET MANIFEST ===\n");

    for (const category of CATEGORIES) {
      const { count, undersized, files } = await folderManifest(category);
      const flag =
        undersized.length > 0
          ? ` — FLAG: ${undersized.length} under 10KB (${undersized.join(", ")})`
          : " — OK";
      console.log(`${category}/: ${count} file(s)${flag}`);
      for (const file of files.sort()) {
        const thumb = isThumbnailFilename(file) ? " [thumbnail]" : "";
        console.log(`  - ${file}${thumb}`);
      }
      console.log("");
    }

    const bottleFiles = await listFolderFiles("bottle");
    const logoFiles = await listFolderFiles("logo");
    const failures = await readFailuresLog();

    const warnings = [];

    if (bottleFiles.length === 0) {
      warnings.push(
        "⚠ bottle/ is EMPTY — manual sourcing required for bottle hero/product stills.",
      );
    } else if (bottleFiles.every(isThumbnailFilename)) {
      warnings.push(
        "⚠ bottle/ contains ONLY thumbnail-sized images — manual sourcing required for full-res bottle assets.",
      );
    }

    if (logoFiles.length === 0) {
      warnings.push(
        "⚠ logo/ is EMPTY — manual sourcing required (need Logo-Natur-die-wirkt-lang.png and cropped-Logo-SonnwerkSolo-270x270.png).",
      );
    } else {
      const missingLogos = [...LOGO_FILENAMES].filter(
        (name) => !logoFiles.includes(name),
      );
      const allThumbs = logoFiles.every(isThumbnailFilename);
      if (missingLogos.length) {
        warnings.push(
          `⚠ logo/ missing expected files: ${missingLogos.join(", ")}`,
        );
      }
      if (allThumbs) {
        warnings.push(
          "⚠ logo/ contains only thumbnail/resized versions — vector or full-res logo may need manual sourcing.",
        );
      }
    }

    if (failures.length) {
      warnings.push(
        `⚠ gate0-failures.log has ${failures.length} entr${failures.length === 1 ? "y" : "ies"} — manual re-run may be needed.`,
      );
    }

    console.log("Download summary:");
    console.log(`  downloaded: ${stats.downloaded}`);
    console.log(`  skipped (already valid): ${stats.skipped}`);
    console.log(`  failed: ${stats.failed}`);

    if (warnings.length) {
      console.log("\nFLAGS:");
      for (const w of warnings) console.log(w);
    } else {
      console.log("\nNo critical flags for bottle/ or logo/.");
    }

    if (failures.length) {
      console.log("\n=== gate0-failures.log ===\n");
      for (const line of failures) console.log(line);
    }
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
