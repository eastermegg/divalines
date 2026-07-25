// Dev-only screenshot helper (not shipped): drives the locally cached
// Chromium against the dev server.
// Usage: node scripts/shot.mjs <url> <outfile> [width] [height] [fullPage] [scrollTo]
import { chromium } from "playwright-core";

const [url, out, w = "1440", h = "900", fullPage = "0", scrollTo = ""] =
  process.argv.slice(2);

const browser = await chromium.launch({
  executablePath:
    "/Users/meghanregior/Library/Caches/ms-playwright/chromium-1140/chrome-mac/Chromium.app/Contents/MacOS/Chromium",
});
const page = await browser.newPage({
  viewport: { width: Number(w), height: Number(h) },
});
await page.goto(url, { waitUntil: "networkidle" });
await page.waitForTimeout(1200);
if (scrollTo) {
  await page.evaluate((y) => window.scrollTo(0, Number(y)), scrollTo);
  await page.waitForTimeout(1200);
}
await page.screenshot({ path: out, fullPage: fullPage === "1" });
await browser.close();
console.log("saved", out);
