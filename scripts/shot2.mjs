import { chromium } from "playwright-core";
const [url, out] = process.argv.slice(2);
const browser = await chromium.launch({ executablePath: "/Users/meghanregior/Library/Caches/ms-playwright/chromium-1140/chrome-mac/Chromium.app/Contents/MacOS/Chromium" });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(url, { waitUntil: "networkidle" });
await page.waitForTimeout(3500); // let the full intro play out
await page.screenshot({ path: out });
await browser.close();
console.log("saved", out);
