import { chromium } from "playwright-core";
const browser = await chromium.launch({ executablePath: "/Users/meghanregior/Library/Caches/ms-playwright/chromium-1140/chrome-mac/Chromium.app/Contents/MacOS/Chromium" });
const page = await browser.newPage({ viewport: { width: 1512, height: 900 } });
await page.goto("http://localhost:4123/", { waitUntil: "networkidle" });
await page.waitForTimeout(3500);
await page.screenshot({ path: ".context/shots/cta-closeup.png", clip: { x: 480, y: 720, width: 560, height: 160 } });
await browser.close();
console.log("saved");
