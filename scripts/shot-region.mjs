import { chromium } from "playwright-core";
const [url, out, x, y, w, h, scroll] = process.argv.slice(2);
const browser = await chromium.launch({ executablePath: "/Users/meghanregior/Library/Caches/ms-playwright/chromium-1140/chrome-mac/Chromium.app/Contents/MacOS/Chromium" });
const page = await browser.newPage({ viewport: { width: 1512, height: 900 } });
await page.goto(url, { waitUntil: "networkidle" });
await page.waitForTimeout(3500);
if (scroll) { await page.evaluate((s) => window.scrollTo(0, document.body.scrollHeight), scroll); await page.waitForTimeout(1500); }
await page.screenshot({ path: out, clip: { x: +x, y: +y, width: +w, height: +h } });
await browser.close();
console.log("saved", out);
